# Execute back command to dump data from Postgres to sdout
kubectl exec -it home-server-pg-finance-project-production-0 -n home-server -- /bin/bash -c 'PGPASSWORD=$POSTGRES_PASSWORD PGDATABASE="$POSTGRES_DB" pg_dump -U postgres --clean'
