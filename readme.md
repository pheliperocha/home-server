# Home Server

## Overview

This project sets up my personal home server using Kubernetes and Helm. It includes various services and applications to manage and automate tasks within my home network environment.

## Features

This project includes a variety of services and applications to enhance and automate my personal home network:

- **Home Assistant**: Open-source home automation platform.
- **NodeRed**: Flow-based development tool for visual programming.
- **Kuma**: Self-hosted monitoring tool.
- **Ntfy**: Push notifications server.
- **Pihole**: DNS and Network-wide ad blocker.
- **Atuin**: Encrypted, synchronized shell history.
- **qBittorrent**: Open-source BitTorrent client.
- **K8up**: Kubernetes backup operator.
- **Postgres**: Databases for several projects within my home server

## Deployment

```bash
helm secrets upgrade --install -n home-server --create-namespace home-server ./kube/ --values ./kube/values.yaml --values ./kube/secrets.yaml
```
