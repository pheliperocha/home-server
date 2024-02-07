# Set environment variables
export AWS_PROFILE=pheliperocha
export RESTIC_REPOSITORY=s3:s3.amazonaws.com/home-server-backups

# Read SQL data from Restic into file
SNAPSHOT_ID=$(restic snapshots --latest 1 --json --path /home-server-postgresql | jq -r '.[0].id')

# Get backup dump from Restic / restore to Postgres directly in the pod
restic dump "$SNAPSHOT_ID" /home-server-postgresql | kubectl exec -it home-server-pg-finance-project-staging-0 -n home-server -- /bin/bash -c 'PGPASSWORD=$POSTGRES_PASSWORD PGDATABASE="$POSTGRES_DB" psql -U postgres'
