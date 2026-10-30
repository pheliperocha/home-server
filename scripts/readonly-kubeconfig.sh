#!/bin/bash
# Prints a kubeconfig for the read-only ServiceAccount (see kube/cluster-readonly).
# Run it on the MicroK8s host; the token is short-lived and never stored in the cluster or in git.
#
#   ssh user@host 'bash -s -- https://<host-lan-ip>:16443' < scripts/readonly-kubeconfig.sh > ~/.kube/home-readonly
#   chmod 600 ~/.kube/home-readonly
#
# Re-run before the token expires (default 720h = 30 days).

set -euo pipefail

SERVER=${1:?usage: readonly-kubeconfig.sh https://<host>:16443 [duration]}
DURATION=${2:-720h}
SA_NAME=claude-readonly
SA_NAMESPACE=kube-system

TOKEN=$(microk8s kubectl create token "$SA_NAME" -n "$SA_NAMESPACE" --duration="$DURATION")
CA=$(microk8s kubectl config view --raw --minify -o jsonpath='{.clusters[0].cluster.certificate-authority-data}')

cat <<KUBECONFIG
apiVersion: v1
kind: Config
clusters:
  - name: home
    cluster:
      server: $SERVER
      certificate-authority-data: $CA
      # The API server cert lists "kubernetes" as a SAN but not the LAN IP.
      tls-server-name: kubernetes
users:
  - name: $SA_NAME
    user:
      token: $TOKEN
contexts:
  - name: home-readonly
    context:
      cluster: home
      user: $SA_NAME
current-context: home-readonly
KUBECONFIG
