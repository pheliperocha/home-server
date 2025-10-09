# 🚀 Drone Launcher

[![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=flat-square&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=flat-square&logo=docker&logoColor=white)](https://www.docker.com/)
[![SQLite](https://img.shields.io/badge/sqlite-%2307405e.svg?style=flat-square&logo=sqlite&logoColor=white)](https://sqlite.org/)

A custom-built NestJS application that automates deployment processes and provides webhook-based CI/CD integration for the home server infrastructure.

## 📋 Overview

Drone Launcher is a microservice that bridges GitHub repositories and Kubernetes deployments, providing automated CI/CD workflows through webhook integration. It handles deployment automation, process monitoring, and provides a RESTful API for deployment management.

## ✨ Features

- 🔗 **GitHub Webhook Integration** - Automated deployments triggered by repository events
- 🛡️ **JWT Authentication** - Secure API access with token-based authorization
- 🏗️ **Kubernetes Integration** - Direct deployment automation to the cluster
- 📊 **Process Monitoring** - Real-time deployment process tracking and logging
- 🔧 **RESTful API** - Comprehensive API for deployment management
- 🗄️ **Database Integration** - SQLite in-memory database with TypeORM for data persistence

## 🛠️ Technology Stack

### Core Framework

- **[NestJS](https://nestjs.com/)** - Progressive Node.js framework
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript

### Database & ORM

- **[Better SQLite3](https://github.com/JoshuaWise/better-sqlite3)** - In-memory SQLite database
- **[TypeORM](https://typeorm.io/)** - Object-Relational Mapping

## 📡 API Reference

### Authentication

Most endpoints require JWT authentication:

```bash
Authorization: Bearer <jwt-token>
```

### Endpoints

#### Root Endpoint

```http
GET /
```

Returns a simple greeting message. No authentication required.

#### Get Deployment Status

```http
GET /status/:processId
```

Returns the status of a specific deployment process by its ID. Requires JWT authentication.

**Parameters:**

- `processId` (string) - The unique identifier of the deployment process

#### GitHub Webhook Receiver

```http
POST /hook
Content-Type: application/json
Authorization: Bearer <jwt-token>
X-Hub-Signature-256: sha256=<hmac-signature>

{
  "data": {
    "app_name": "my-app",
    "target": "production",
    "commitId": "abc123..."
  },
  "after": "commit-hash",
  "head_commit": {
    "id": "commit-hash"
  },
  "sender": {
    "id": 12345,
    "login": "username"
  }
}
```

Receives GitHub webhook payloads and triggers deployment processes. Protected by multiple security layers:

**Authentication Guards:**

- **AuthGuard**: Validates JWT Bearer token AND verifies GitHub webhook signature using HMAC-SHA256 with the configured webhook secret to ensure the request is genuinely from GitHub
- **AppGuard**: Validates that the `app_name` is configured in the system AND that the GitHub user (`sender.id` and `sender.login`) is in the allowed users list for that application

**Required payload fields:**

- `data.app_name` - Application name to deploy (must be configured in app config map)
- `data.target` - Target environment (must be valid target type)
- `after` or `data.commitId` or `head_commit.id` - Commit identifier
- `sender.id` and `sender.login` - GitHub user information (must be in allowed users list)

## 🏗️ Architecture

### Key Components

- **Controllers**: Define API endpoints and handle HTTP requests
- **Commands**: Handle deployment requests and state changes
- **Handlers**: Process commands and execute business logic
- **Guards**: JWT authentication and authorization
- **DTOs**: Request/response validation and transformation
- **Entities**: Database schema and relationships

## 🔐 Security

### Multi-Layer Authentication System

The application implements a comprehensive security model with multiple validation layers:

#### AuthGuard - Dual Authentication

1. **JWT Bearer Token Validation**: Verifies the `Authorization: Bearer <token>` header against the configured token
2. **GitHub Webhook Signature Verification**: Uses HMAC-SHA256 to validate the `X-Hub-Signature-256` header against the webhook secret, ensuring requests are genuinely from GitHub and haven't been tampered with

```typescript
// Signature verification process
const signature = crypto
  .createHmac('sha256', webhookSecret)
  .update(rawBody)
  .digest('hex');

const trusted = Buffer.from(`sha256=${signature}`, 'ascii');
const untrusted = Buffer.from(incomingSignature, 'ascii');

return crypto.timingSafeEqual(trusted, untrusted);
```

#### AppGuard - Application-Level Access Control

1. **Application Configuration Validation**: Ensures the `data.app_name` exists in the configured app config map
2. **User Authorization**: Validates that the GitHub user (`sender.id` and `sender.login`) is in the allowed users list for the specific application

### Kubernetes RBAC Security

The application uses Kubernetes Role-Based Access Control (RBAC) for secure cluster operations:

**Security Benefits:**

- **Namespace Isolation**: Can only deploy to explicitly configured namespaces
- **Limited Permissions**: Only has access to resources necessary for deployments
- **Service Account Binding**: Runs with a dedicated service account, not default permissions
- **Separate RoleBindings**: Each target environment has its own RoleBinding (e.g., `finance-project-staging`, `finance-project-production`)
- **Principle of Least Privilege**: Service account only has access to resources needed for deployments
- **Cross-Namespace Access**: ClusterRole allows the service to deploy to specific target namespaces while running in its own namespace

### Security Features

- **Timing-Safe Comparison**: Uses `crypto.timingSafeEqual()` to prevent timing attacks
- **Raw Body Validation**: Signature verification uses the raw request body to prevent manipulation
- **Multi-Factor Authentication**: Combines token authentication with cryptographic signature verification
- **Granular Access Control**: Per-application user whitelisting
- **Request Integrity**: Ensures webhook payloads haven't been modified in transit
- **Kubernetes RBAC**: Fine-grained permissions with namespace isolation for secure cluster operations

## 🔄 CI/CD Integration

### GitHub Actions Integration

Use the following GitHub Actions workflow step to trigger deployments:

```yaml
- name: Launcher webhook
  uses: distributhor/workflow-webhook@v3
  with:
    webhook_url: ${{ secrets.LAUNCHER_WEBHOOK_URL }}
    webhook_secret: ${{ secrets.LAUNCHER_WEBHOOK_SECRET }}
    webhook_auth_type: 'bearer'
    webhook_auth: ${{ secrets.LAUNCHER_WEBHOOK_AUTH }}
    webhook_type: 'json-extended'
    data: '{ "target": "staging", "app_name": "finance-project" }'
```

**Required GitHub Secrets:**

- `LAUNCHER_WEBHOOK_URL` - The full webhook URL (e.g., `https://your-domain.com/hook`)
- `LAUNCHER_WEBHOOK_SECRET` - The webhook secret for HMAC signature validation
- `LAUNCHER_WEBHOOK_AUTH` - The JWT Bearer token for authentication

**Workflow Data Fields:**

- `target` - Deployment target environment (staging, production, etc.)
- `app_name` - Application name (must be configured in the app config map)

### Deployment Process

#### 1. Authentication & Validation

1. GitHub Actions sends request to Drone Launcher
2. Drone Launcher validates JWT token and webhook signature
3. AppGuard verifies app configuration and user permissions
4. LaunchCommand is created and executed via CommandBus

#### 2. Deployment Workflow

1. **Repository Cloning**: Clone the specified GitHub repository using git token
2. **Commit Checkout**: Switch to the specific commit ID for deployment
3. **Image Tag Update**: Update `kube/values.yaml` to set image tag to commit ID
4. **Version Extraction**: Read application version from `package.json`
5. **Helm Release**: Deploy application using Helm to target namespace (`{app}-{target}`)
6. **Release Verification**: Verify deployment success using kubectl
7. **Notification**: Send success/failure notification via Ntfy service
8. **Process Logging**: All steps are logged and can be queried via `/status/:processId`

#### Error Handling

- Each step includes comprehensive error handling and logging
- Failed deployments trigger error notifications
- Process logs provide detailed troubleshooting information

## 🤝 Contributing

This is a personal project component. While the code is open for reference, it's not intended for external contributions.

## 📄 License

This project is part of the home-server infrastructure and follows the same MIT License as the parent project.

---

**Part of**: [Personal Home Server](../../README.md)
