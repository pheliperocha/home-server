# Recovery

How to get data back from backups, and how to rehearse it (a drill) without
touching anything that runs.

## What is backed up

| Data                                                                                | How                                       | Where                                                                        | When                                   |
| ----------------------------------------------------------------------------------- | ----------------------------------------- | ---------------------------------------------------------------------------- | -------------------------------------- |
| finance-project production DB                                                       | CloudNativePG (barman: base backup + WAL) | `s3://finance-project-backups/cnpg-production/pg-finance-project-production` | daily 02:00, WAL continuously, 30 days |
| lastro DB                                                                           | CloudNativePG (barman)                    | `s3://lastro-backups/cnpg-production/lastro-db`                              | daily 03:00, WAL continuously, 30 days |
| PVCs in `home-server` (homeassistant, nodered, ntfy) and the Home Assistant pg_dump | k8up (Restic)                             | `s3://home-server-backups`                                                   | Mondays 02:00, last 5                  |
| `kuma-pv-claim`                                                                     | k8up (Restic)                             | `s3://home-server-backups`                                                   | Mondays 02:00, last 5                  |

## Databases (CloudNativePG)

Each DB chart (`kube/finance-project-db-production`, `kube/lastro-db`) has a
`restore` block in its `values.yaml`. With `restore.enabled: true` the Cluster
is created from the backups (`bootstrap.recovery`) instead of an empty
`initdb`. Bootstrap only runs when the Cluster is created, so turning it on for
a running cluster changes nothing.

### Real recovery (example: lastro)

1. Stop the app so nothing writes: `kubectl scale deploy -n lastro --all --replicas=0`.
2. In `kube/lastro-db/values.yaml`:
   - `restore.enabled: true`
   - optional `restore.targetTime: "2026-11-09T10:00:00Z"` to go back to a point in time
   - `backup.serverName: lastro-db-r1` (a new folder: the new cluster must not
     write into the WAL archive it is restoring from)
   - `restore.sourceServerName: lastro-db` (the folder to read from)
3. Delete the broken cluster and its volume:
   `kubectl delete cluster lastro-db -n lastro` (its PVC goes with it).
4. `helmfile -l name=lastro-db apply` and watch
   `kubectl get pods -n lastro -w` until `lastro-db-1` is Ready.
5. Check the data (`scripts/pg-rowcounts.sh -n lastro -c lastro-db -d lastro`), then
   start the app: `helmfile -l name=lastro apply`.
6. Commit the values. Leave `restore.enabled: true` and the server names as they
   are: they now describe this cluster. A future recovery reads from
   `lastro-db-r1` and writes to `lastro-db-r2`.

## PVCs (k8up / Restic)

`scripts/restore-pvc.sh` finds the latest k8up snapshot of a PVC (or the one
you pass with `-s`), creates the target PVC if needed, runs a k8up `Restore`,
waits, and prints how long it took. `--dry-run` prints the manifests only.

### Real recovery (example: kuma)

```bash
kubectl scale deploy kuma -n kuma --replicas=0
scripts/restore-pvc.sh -n kuma -p kuma-pv-claim       # refuses if a running pod uses the PVC
# check the files are where the app expects them (see "Look inside a PVC")
kubectl scale deploy kuma -n kuma --replicas=1
```

### Look inside a PVC

```bash
NS=kuma PVC=kuma-pv-claim
kubectl apply -n $NS -f - <<YAML
apiVersion: v1
kind: Pod
metadata: {name: inspect-pvc}
spec:
  restartPolicy: Never
  containers:
    - name: inspect
      image: alpine:3.20
      command: ["sleep", "3600"]
      volumeMounts: [{name: data, mountPath: /pvc, readOnly: true}]
  volumes: [{name: data, persistentVolumeClaim: {claimName: $PVC, readOnly: true}}]
YAML
kubectl wait -n $NS --for=condition=Ready pod/inspect-pvc
kubectl exec -n $NS inspect-pvc -- sh -c 'du -sh /pvc; find /pvc -maxdepth 4'
kubectl delete pod -n $NS inspect-pvc
```

## Running a drill

A drill restores a database and a PVC into a scratch namespace, checks the
data, and deletes everything. It uses the same chart and script as a real
recovery, so it tests the real path. Example: finance production DB and kuma.

```bash
# 1. Scratch namespace with copies of the two backup secrets
kubectl create namespace restore-drill
for s in finance-project-production/aws-secrets kuma/k8up-secrets; do
  kubectl get secret -n "${s%%/*}" "${s##*/}" -o json |
    jq '{apiVersion, kind, type, data, metadata: {name: .metadata.name}}' |
    kubectl apply -n restore-drill -f -
done

# 2. Database: same chart, restore on, backups off (never write to the prod bucket).
#    Optional: --set pg_finance_project_production.restore.targetTime=2026-11-09T10:00:00Z
helm install restore-drill kube/finance-project-db-production -n restore-drill \
  --set pg_finance_project_production.restore.enabled=true \
  --set pg_finance_project_production.backup.enabled=false
kubectl get pods -n restore-drill -w      # wait for pg-finance-project-production-1 Ready

scripts/pg-rowcounts.sh -n finance-project-production -c pg-finance-project-production -d fp_production > prod.tsv
scripts/pg-rowcounts.sh -n restore-drill -c pg-finance-project-production -d fp_production > drill.tsv
diff prod.tsv drill.tsv   # differences only in tables written after the last archived WAL

# 3. PVC
scripts/restore-pvc.sh -n kuma -p kuma-pv-claim --to-namespace restore-drill --to-pvc drill-kuma
# then "Look inside a PVC" with NS=restore-drill PVC=drill-kuma

# 4. Clean up
helm uninstall restore-drill -n restore-drill
kubectl delete namespace restore-drill
```

## Browsing Restic by hand

`scripts/mount-restic.sh` mounts the whole Restic repo locally (needs
`RESTIC_PASSWORD` and the AWS profile).

`scripts/restore-postgres.sh` and `scripts/backup-postgres.sh` target the old
Bitnami Postgres pods, which no longer exist. They are kept for reference only.
