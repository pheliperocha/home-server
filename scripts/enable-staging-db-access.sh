#!/bin/bash

NETWORK_PREFIX=192.168.1
HOST_IP=$NETWORK_PREFIX.12
CUSTOM_PORT=62345
STAGING_DB_SERVICE_NAME=home-server-pg-finance-project-staging

cleanup_and_exit() {
    ./disable-staging-db-access.sh
    exit
}

trap cleanup_and_exit SIGINT SIGTERM SIGHUP SIGQUIT SIGKILL

echo "Starting port-forward process to access staging DB at port $CUSTOM_PORT..."
nohup kubectl port-forward --address $HOST_IP -n home-server svc/$STAGING_DB_SERVICE_NAME $CUSTOM_PORT:5432 & PORT_FORWARD_PID=$!
echo "kubectl port-forward process is running with PID: $PORT_FORWARD_PID"

echo "Enabling firewall rule to allow access to staging DB from local network..."
sudo ufw allow from $NETWORK_PREFIX.0/24 to $HOST_IP port $CUSTOM_PORT comment 'Enabled: Temporary Staging DB Access'
echo "Firewall rule enabled."

# 2 hours
sleep 7200

cleanup_and_exit