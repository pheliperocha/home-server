#!/bin/bash

NETWORK_PREFIX=192.168.1
HOST_IP=$NETWORK_PREFIX.12
CUSTOM_PORT=62345
STAGING_DB_SERVICE_NAME=home-server-pg-finance-project-staging

echo "Disabling firewall rule to deny access to staging DB from local network..."
sudo ufw deny from $NETWORK_PREFIX.0/24 to $HOST_IP port $CUSTOM_PORT comment 'Disabled: Temporary Staging DB Access'
echo "Firewall rule disabled."

PORT_FORWARD_PID=$(ps -ef | grep "kubectl port-forward --address $HOST_IP -n home-server svc/$STAGING_DB_SERVICE_NAME" | grep -v grep | awk '{print $2}')
echo "Terminating kubectl port-forward process with PID $PORT_FORWARD_PID..."
kill $PORT_FORWARD_PID
echo "kubectl port-forward process terminated."
