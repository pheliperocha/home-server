#!/usr/bin/env bash
# Restore a PVC from the k8up/Restic backups (bucket home-server-backups).
#
# Real recovery (into the original PVC; stop the app first):
#   scripts/restore-pvc.sh -n kuma -p kuma-pv-claim
# Drill (into a scratch PVC in another namespace):
#   scripts/restore-pvc.sh -n kuma -p kuma-pv-claim --to-namespace restore-drill --to-pvc drill-kuma
#
# Options:
#   -n, --namespace NS      namespace of the backed-up PVC (where its k8up Snapshots live)
#   -p, --pvc NAME          backed-up PVC name (snapshot path /data/NAME)
#   -s, --snapshot ID       snapshot id (default: latest for that PVC)
#   --to-namespace NS       namespace to restore into (default: same as -n). Needs k8up-secrets there.
#   --to-pvc NAME           PVC to restore into (default: same as -p). Created if missing.
#   --size SIZE             size for a newly created PVC (default: 1Gi)
#   --force                 restore even if a running pod mounts the target PVC
#   --dry-run               print what would be applied and exit
#
# Needs a kubeconfig with write access. See docs/recovery.md.
set -euo pipefail

NS="" PVC="" SNAPSHOT="" TO_NS="" TO_PVC="" SIZE="1Gi" FORCE=false DRY_RUN=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    -n|--namespace) NS="$2"; shift 2 ;;
    -p|--pvc) PVC="$2"; shift 2 ;;
    -s|--snapshot) SNAPSHOT="$2"; shift 2 ;;
    --to-namespace) TO_NS="$2"; shift 2 ;;
    --to-pvc) TO_PVC="$2"; shift 2 ;;
    --size) SIZE="$2"; shift 2 ;;
    --force) FORCE=true; shift ;;
    --dry-run) DRY_RUN=true; shift ;;
    -h|--help) sed -n '2,22p' "$0"; exit 0 ;;
    *) echo "Unknown option: $1" >&2; exit 1 ;;
  esac
done

[[ -n "$NS" && -n "$PVC" ]] || { echo "Usage: $0 -n NAMESPACE -p PVC [options] (see --help)" >&2; exit 1; }
TO_NS="${TO_NS:-$NS}"
TO_PVC="${TO_PVC:-$PVC}"

log() { echo "[$(date +%H:%M:%S)] $*" >&2; }

# 1. Find the snapshot.
if [[ -z "$SNAPSHOT" ]]; then
  SNAPSHOT=$(kubectl get snapshots.k8up.io -n "$NS" -o json |
    jq -r --arg p "/data/$PVC" '[.items[] | select(.spec.paths | index($p))] | sort_by(.spec.date) | last | .spec.id // empty')
  [[ -n "$SNAPSHOT" ]] || { echo "No k8up snapshot found for /data/$PVC in namespace $NS" >&2; exit 1; }
fi
SNAP_DATE=$(kubectl get snapshots.k8up.io -n "$NS" -o json |
  jq -r --arg id "$SNAPSHOT" '.items[] | select(.spec.id == $id or (.spec.id | startswith($id))) | .spec.date' | head -1)
log "Snapshot ${SNAPSHOT:0:8} of /data/$PVC, taken ${SNAP_DATE:-unknown}"

# 2. Safety: refuse to write into a PVC that a running pod uses.
USERS=$(kubectl get pods -n "$TO_NS" -o json 2>/dev/null |
  jq -r --arg c "$TO_PVC" '.items[] | select(.status.phase == "Running") | select([.spec.volumes[]?.persistentVolumeClaim.claimName] | index($c)) | .metadata.name')
if [[ -n "$USERS" && "$FORCE" != true ]]; then
  echo "PVC $TO_NS/$TO_PVC is mounted by running pod(s): $USERS" >&2
  echo "Scale the app to 0 first, or pass --force." >&2
  exit 1
fi

RESTORE_NAME="restore-${TO_PVC}-$(date +%Y%m%d%H%M%S)"
RESTORE_NAME="${RESTORE_NAME:0:63}"

PVC_MANIFEST=$(cat <<EOF
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: ${TO_PVC}
  namespace: ${TO_NS}
spec:
  accessModes: ["ReadWriteOnce"]
  resources:
    requests:
      storage: ${SIZE}
EOF
)

RESTORE_MANIFEST=$(cat <<EOF
apiVersion: k8up.io/v1
kind: Restore
metadata:
  name: ${RESTORE_NAME}
  namespace: ${TO_NS}
spec:
  snapshot: ${SNAPSHOT}
  restoreMethod:
    folder:
      claimName: ${TO_PVC}
  podSecurityContext:
    runAsUser: 0
  backend:
    s3:
      endpoint: https://s3.sa-east-1.amazonaws.com
      bucket: home-server-backups
      accessKeyIDSecretRef:
        name: k8up-secrets
        key: AWS_ACCESS_KEY_ID
      secretAccessKeySecretRef:
        name: k8up-secrets
        key: AWS_SECRET_ACCESS_KEY
    repoPasswordSecretRef:
      name: k8up-secrets
      key: RESTIC_REPOSITORY_PASSWORD
EOF
)

PVC_EXISTS=false
kubectl get pvc "$TO_PVC" -n "$TO_NS" >/dev/null 2>&1 && PVC_EXISTS=true

if [[ "$DRY_RUN" == true ]]; then
  [[ "$PVC_EXISTS" == true ]] || { echo "$PVC_MANIFEST"; echo "---"; }
  echo "$RESTORE_MANIFEST"
  exit 0
fi

kubectl get secret k8up-secrets -n "$TO_NS" >/dev/null 2>&1 ||
  { echo "Secret k8up-secrets is missing in $TO_NS (see docs/recovery.md)" >&2; exit 1; }

# 3. Apply.
START=$(date +%s)
if [[ "$PVC_EXISTS" != true ]]; then
  log "Creating PVC $TO_NS/$TO_PVC ($SIZE)"
  echo "$PVC_MANIFEST" | kubectl apply -f -
fi
log "Starting restore $TO_NS/$RESTORE_NAME into $TO_PVC"
echo "$RESTORE_MANIFEST" | kubectl apply -f -

# 4. Wait for the restore to finish (k8up sets status.finished).
for _ in $(seq 1 180); do
  FINISHED=$(kubectl get restores.k8up.io "$RESTORE_NAME" -n "$TO_NS" -o jsonpath='{.status.finished}' 2>/dev/null || true)
  [[ "$FINISHED" == "true" ]] && break
  sleep 5
done
END=$(date +%s)

kubectl get restores.k8up.io "$RESTORE_NAME" -n "$TO_NS" \
  -o jsonpath='{range .status.conditions[*]}{.type}={.status} ({.reason}) {.message}{"\n"}{end}' >&2 || true
if [[ "$FINISHED" != "true" ]]; then
  log "Restore did not finish within 15 minutes. Check: kubectl get pods -n $TO_NS"
  exit 1
fi
log "Restore finished in $((END - START))s. Check the files before starting the app (docs/recovery.md, \"Look inside a PVC\")."
