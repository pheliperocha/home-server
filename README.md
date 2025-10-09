# 🏠 Personal Home Server

This repository contains the complete infrastructure and application code for my personal home server setup. While the code is public for portfolio and educational purposes, **this is not intended for external contributions or pull requests**.

## 📋 Table of Contents

- [Overview](#-overview)
- [Architecture](#️-architecture)
- [Tools & Technologies](#️-tools--technologies)
- [Services Running](#️-services-running)
- [Hardware Specifications](#️-hardware-specifications)
- [Security Considerations](#-security-considerations)
- [License & Usage](#-license--usage)

## 📋 Overview

This is a production-ready Kubernetes-based home server that automates deployments, monitors services, and manages various personal applications. The setup demonstrates modern DevOps practices, cloud-native architecture, and GitOps workflows.

**Key Features:**

- 🚀 Automated deployment with Helmfile and Helm charts
- 🔐 End-to-end security with cert-manager and Cloudflare Tunnel
- 💾 Automated backup system with K8up and Restic
- 🏠 Smart home integration with Home Assistant and Node-RED
- 📊 Comprehensive monitoring with Prometheus, Grafana, and Loki
- 🔧 Custom deployment automation with Drone Launcher

## 🏗️ Architecture

**Data Flow:**

1. **External Access**: Internet → Cloudflare Edge → Cloudflare Tunnel → NGINX Ingress → Services
2. **Internal Services**: Applications communicate through Kubernetes services
3. **Monitoring**: Alloy collects metrics/logs → Prometheus/Loki → Grafana dashboards
4. **Storage**: Applications use NFS/Local PVs, with automated backups via K8up to S3
5. **Home Automation**: Home Assistant ↔ Node-RED ↔ Smart Home Devices

## ⚙️ Tools & Technologies

| Logo | Technology | Description |
|------|------------|-------------|
| ![Kubernetes](https://img.shields.io/badge/kubernetes-%23326ce5.svg?style=for-the-badge&logo=kubernetes&logoColor=white) | **[Kubernetes](https://kubernetes.io/)** | Container orchestration platform |
| ![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white) | **[Docker](https://www.docker.com/)** | Application containerization |
| ![Helm](https://img.shields.io/badge/Helm-0F1689?style=for-the-badge&logo=Helm&labelColor=0F1689) | **[Helm](https://helm.sh/)** | Package manager for Kubernetes applications |
| ![Helmfile](https://img.shields.io/badge/Helmfile-326CE5?style=for-the-badge&logo=helm&logoColor=white) | **[Helmfile](https://helmfile.readthedocs.io/)** | Declarative deployment management |
| ![Restic](https://img.shields.io/badge/Restic-FF6600?style=for-the-badge&logo=database&logoColor=white) | **[Restic](https://restic.net/)** | S3 backup repository for K8up backups |

## 🛠️ Services Running

### Core Infrastructure

| Logo | Service | Description |
|------|---------|-------------|
| ![cert-manager](https://img.shields.io/badge/cert--manager-FF6C37?style=for-the-badge&logo=letsencrypt&logoColor=white) | **[cert-manager](https://cert-manager.io/)** | Automated TLS certificate management |
| ![NGINX](https://img.shields.io/badge/nginx-%23009639.svg?style=for-the-badge&logo=nginx&logoColor=white) | **[NGINX Ingress Controller](https://kubernetes.github.io/ingress-nginx/)** | Traffic routing and SSL termination |
| ![Cloudflare](https://img.shields.io/badge/Cloudflare-F38020?style=for-the-badge&logo=Cloudflare&logoColor=white) | **[Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/)** | Secure remote access without port forwarding |
| ![K8up](https://img.shields.io/badge/K8up-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white) | **[K8up](https://k8up.io/)** | Automated backup system |
| ![Kubernetes](https://img.shields.io/badge/kubernetes-%23326ce5.svg?style=for-the-badge&logo=kubernetes&logoColor=white) | **[Kubernetes Dashboard](https://kubernetes.io/docs/tasks/access-application-cluster/web-ui-dashboard/)** | Cluster management interface |
| ![NFS](https://img.shields.io/badge/NFS-4285F4?style=for-the-badge&logo=files&logoColor=white) | **NFS** | Network file system for persistent storage |
| ![MinIO](https://img.shields.io/badge/MinIO-C72E49?style=for-the-badge&logo=minio&logoColor=white) | **[MinIO](https://min.io/)** | S3-compatible object storage |
| ![PostgreSQL](https://img.shields.io/badge/postgresql-4169e1?style=for-the-badge&logo=postgresql&logoColor=white) | **[PostgreSQL](https://www.postgresql.org/)** | Relational database service |

### Monitoring & Observability

| Logo | Service | Description |
|------|---------|-------------|
| ![Prometheus](https://img.shields.io/badge/Prometheus-E6522C?style=for-the-badge&logo=Prometheus&logoColor=white) | **[Prometheus](https://prometheus.io/)** | Metrics collection and alerting |
| ![Grafana](https://img.shields.io/badge/grafana-%23F46800.svg?style=for-the-badge&logo=grafana&logoColor=white) | **[Grafana](https://grafana.com/)** | Visualization and dashboards |
| ![Grafana](https://img.shields.io/badge/Loki-F46800?style=for-the-badge&logo=grafana&logoColor=white) | **[Loki](https://grafana.com/oss/loki/)** | Log aggregation |
| ![Grafana](https://img.shields.io/badge/Alloy-F46800?style=for-the-badge&logo=grafana&logoColor=white) | **[Alloy](https://grafana.com/docs/alloy/)** | Telemetry collection |
| ![Uptime Kuma](https://img.shields.io/badge/Uptime%20Kuma-5CDD8B?style=for-the-badge&logo=statuspage&logoColor=white) | **[Kuma](https://uptime.kuma.pet/)** | Uptime monitoring |

### Applications

| Logo | Service | Description |
|------|---------|-------------|
| ![Home Assistant](https://img.shields.io/badge/home%20assistant-%2341BDF5.svg?style=for-the-badge&logo=home-assistant&logoColor=white) | **[Home Assistant](https://www.home-assistant.io/)** | Home automation platform |
| ![Node-RED](https://img.shields.io/badge/Node--RED-%238F0000.svg?style=for-the-badge&logo=node-red&logoColor=white) | **[Node-RED](https://nodered.org/)** | Visual programming for IoT workflows |
| ![Pi-hole](https://img.shields.io/badge/Pi--hole-96060C?style=for-the-badge&logo=pi-hole&logoColor=white) | **[Pi-hole](https://pi-hole.net/)** | DNS filtering and ad blocking |
| ![qBittorrent](https://img.shields.io/badge/qbittorrent-%232f3f4a.svg?style=for-the-badge&logo=qbittorrent&logoColor=white) | **[qBittorrent](https://www.qbittorrent.org/)** | Torrent client with web interface |
| ![Ntfy](https://img.shields.io/badge/Ntfy-338BA8?style=for-the-badge&logo=bell&logoColor=white) | **[Ntfy](https://ntfy.sh/)** | Push notification service |
| ![Atuin](https://img.shields.io/badge/Atuin-000000?style=for-the-badge&logo=terminal&logoColor=white) | **[Atuin](https://atuin.sh/)** | Shell history sync |
| ![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white) | **[Drone Launcher](apps/drone-launcher/README.md)** | A custom-built NestJS application that automates deployment processes and provides webhook-based CI/CD integration. |

## 🖥️ Hardware Specifications

| Component | Specification |
|-----------|---------------|
| **CPU** | Intel Core i7-8550U |
| **RAM** | 16 GB DDR4 |
| **Storage** | 240 GB SSD + 1 TB HDD |
| **Operating System** | Ubuntu Server 24.04.3 LTS |
| **Kubernetes** | MicroK8s v1.32.9 |

## 🔐 Security Considerations

This repository demonstrates production-ready security practices:

- **No Hardcoded Secrets**: All sensitive data via environment variables
- **Encrypted Secret Management**: All cluster secrets are managed in a separate private repository using [SOPS](https://github.com/mozilla/sops) for encryption
- **Secure Remote Access**: Cloudflare Tunnel provides secure internet exposure without opening firewall ports
- **Secure Communications**: TLS everywhere
- **Principle of Least Privilege**: Minimal required permissions

## 🤝 Contributing

This is a personal project. While the code is publicly available for learning purposes, this is a personal configuration not intended for external contributions or direct replication. Feel free to fork and adapt the concepts for your own use!

## 📄 License & Usage

This project is open source under the MIT License and serves as a portfolio demonstration of modern home server infrastructure.
