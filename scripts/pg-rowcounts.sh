#!/usr/bin/env bash
# Exact row count of every table in a CloudNativePG database, as sorted TSV.
# Run it on the source and on the restored copy, then diff the two files:
#
#   scripts/pg-rowcounts.sh -n finance-project-production -c pg-finance-project-production -d fp_production > prod.tsv
#   scripts/pg-rowcounts.sh -n restore-drill -c pg-finance-project-production -d fp_production > drill.tsv
#   diff prod.tsv drill.tsv
#
# Needs a kubeconfig that can exec into the database pod.
set -euo pipefail

NS="" CLUSTER="" DB=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    -n|--namespace) NS="$2"; shift 2 ;;
    -c|--cluster) CLUSTER="$2"; shift 2 ;;
    -d|--database) DB="$2"; shift 2 ;;
    -h|--help) sed -n '2,9p' "$0"; exit 0 ;;
    *) echo "Unknown option: $1" >&2; exit 1 ;;
  esac
done
[[ -n "$NS" && -n "$CLUSTER" && -n "$DB" ]] || { echo "Usage: $0 -n NAMESPACE -c CLUSTER -d DATABASE" >&2; exit 1; }

POD=$(kubectl get pods -n "$NS" -l "cnpg.io/cluster=$CLUSTER,cnpg.io/instanceRole=primary" -o jsonpath='{.items[0].metadata.name}')
[[ -n "$POD" ]] || { echo "No primary pod for cluster $CLUSTER in $NS" >&2; exit 1; }

SQL="
select table_schema || '.' || table_name,
       (xpath('/row/c/text()',
              query_to_xml(format('select count(*) as c from %I.%I', table_schema, table_name), false, true, '')))[1]::text
from information_schema.tables
where table_type = 'BASE TABLE'
  and table_schema not in ('pg_catalog', 'information_schema')
order by 1;"

kubectl exec -n "$NS" "$POD" -c postgres -- psql -d "$DB" -X -At -F $'\t' -c "$SQL"
