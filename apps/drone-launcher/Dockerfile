FROM node:18.16-alpine AS builder
WORKDIR /app

RUN apk update

COPY --chown=node:node package.json ./
COPY --chown=node:node yarn.lock ./

RUN yarn install --frozen-lockfile

COPY --chown=node:node . .

RUN yarn build

RUN yarn install --frozen-lockfile --production

RUN wget https://gobinaries.com/tj/node-prune --output-document - | /bin/sh && node-prune

FROM node:18.16-alpine AS runner

RUN apk update

# Helm, Kubectl, awscli references
# https://github.com/alpine-docker/k8s/blob/master/Dockerfile

ARG KUBECTL_VERSION=1.17.5
ARG HELM_VERSION=3.2.1
ARG SOPS_VERSION="3.7.3"
ARG HELM_SECRETS_VERSION="4.4.2"

# Install helm
RUN case `uname -m` in \
  x86_64) ARCH=amd64; ;; \
  armv7l) ARCH=arm; ;; \
  aarch64) ARCH=arm64; ;; \
  ppc64le) ARCH=ppc64le; ;; \
  s390x) ARCH=s390x; ;; \
  *) echo "un-supported arch, exit ..."; exit 1; ;; \
  esac && \
  echo "export ARCH=$ARCH" > /envfile && \
  cat /envfile

RUN . /envfile && echo $ARCH && \
  apk add --update --no-cache curl ca-certificates bash git && \
  curl -sL https://get.helm.sh/helm-v${HELM_VERSION}-linux-${ARCH}.tar.gz | tar -xvz && \
  mv linux-${ARCH}/helm /usr/bin/helm && \
  chmod +x /usr/bin/helm && \
  rm -rf linux-${ARCH}

# Install kubectl
RUN . /envfile && echo $ARCH && \
  curl -sLO https://storage.googleapis.com/kubernetes-release/release/v${KUBECTL_VERSION}/bin/linux/${ARCH}/kubectl && \
  mv kubectl /usr/bin/kubectl && \
  chmod +x /usr/bin/kubectl

# Install awscli
RUN apk add --update --no-cache python3 && \
  python3 -m ensurepip && \
  pip3 install --upgrade pip && \
  pip3 install awscli && \
  pip3 cache purge

# Install sops
RUN curl -fsSL https://github.com/mozilla/sops/releases/download/v${SOPS_VERSION}/sops-v${SOPS_VERSION}.linux \
  -o /usr/local/bin/sops && chmod +x /usr/local/bin/sops

USER node

# Add helm-secrets plugin
RUN helm plugin install https://github.com/jkroepke/helm-secrets --version v${HELM_SECRETS_VERSION}

WORKDIR /app

COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/dist ./dist

ENTRYPOINT [ "/bin/sh" ]