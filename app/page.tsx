'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const helmChartDocs = `# Helm Chart Reference

A comprehensive Helm chart guide for deploying applications on Kubernetes.

## Prerequisites

- Kubernetes 1.19+
- Helm 3.2.0+

## Installing the Chart

To install the chart with the release name \`my-release\`:

\`\`\`bash
helm install my-release .
\`\`\`

## Uninstalling the Chart

To uninstall/delete the \`my-release\` deployment:

\`\`\`bash
helm uninstall my-release
\`\`\`

## Configuration

The following table lists the configurable parameters and their default values.

| Parameter | Description | Default |
|-----------|-------------|---------|
| \`replicaCount\` | Number of replicas | \`2\` |
| \`image.repository\` | Image repository | \`your-app\` |
| \`image.tag\` | Image tag | \`latest\` |
| \`image.pullPolicy\` | Image pull policy | \`IfNotPresent\` |
| \`service.type\` | Kubernetes service type | \`ClusterIP\` |
| \`service.port\` | Service port | \`80\` |
| \`service.targetPort\` | Container port | \`8080\` |
| \`ingress.enabled\` | Enable ingress | \`false\` |
| \`ingress.className\` | Ingress class name | \`nginx\` |
| \`resources.limits.cpu\` | CPU limit | \`500m\` |
| \`resources.limits.memory\` | Memory limit | \`512Mi\` |
| \`resources.requests.cpu\` | CPU request | \`250m\` |
| \`resources.requests.memory\` | Memory request | \`256Mi\` |
| \`autoscaling.enabled\` | Enable HPA | \`false\` |
| \`autoscaling.minReplicas\` | Minimum replicas | \`2\` |
| \`autoscaling.maxReplicas\` | Maximum replicas | \`10\` |

## Examples

### Install with custom values

\`\`\`bash
helm install my-release . \\
  --set image.repository=myapp \\
  --set image.tag=v1.0.0 \\
  --set ingress.enabled=true \\
  --set ingress.hosts[0].host=myapp.example.com
\`\`\`

### Install with values file

Create a \`custom-values.yaml\`:

\`\`\`yaml
image:
  repository: myapp
  tag: v1.0.0

ingress:
  enabled: true
  hosts:
    - host: myapp.example.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: myapp-tls
      hosts:
        - myapp.example.com

autoscaling:
  enabled: true
  minReplicas: 3
  maxReplicas: 10
\`\`\`

Then install:

\`\`\`bash
helm install my-release . -f custom-values.yaml
\`\`\`
`

const kubernetesDocs = `# Kubernetes Troubleshooting Runbook
A comprehensive guide for troubleshooting common Kubernetes issues.

## Pod Issues

### Pod Not Starting / CrashLoopBackOff

**Diagnosis:**
\`\`\`bash
kubectl get pods -n <namespace>
kubectl describe pod <pod-name> -n <namespace>
kubectl logs <pod-name> -n <namespace>
kubectl logs <pod-name> -n <namespace> --previous
\`\`\`

**Common Causes:**
- Image pull errors
- Missing secrets/configmaps
- Resource limits too low
- Application errors
- Failed health checks

### ImagePullBackOff

**Solutions:**
\`\`\`bash
kubectl create secret docker-registry regcred \\
  --docker-server=<registry-url> \\
  --docker-username=<username> \\
  --docker-password=<password> \\
  -n <namespace>
\`\`\`

### OOMKilled (Out of Memory)

**Solutions:**
\`\`\`bash
kubectl patch deployment <deployment-name> -n <namespace> -p \\
  '{"spec":{"template":{"spec":{"containers":[{"name":"<container>","resources":{"limits":{"memory":"1Gi"}}}]}}}}'
\`\`\`

## Service and Networking

### Service Not Reachable

\`\`\`bash
kubectl get svc -n <namespace>
kubectl get endpoints <service-name> -n <namespace>
kubectl run tmp-shell --rm -i --tty --image nicolaka/netshoot -- /bin/bash
\`\`\`

## Quick Reference

\`\`\`bash
kubectl get all -n <namespace>
kubectl get pods -n <namespace> -w
kubectl scale deployment <deployment> -n <namespace> --replicas=3
kubectl rollout status deployment/<deployment> -n <namespace>
kubectl rollout undo deployment/<deployment> -n <namespace>
\`\`\`
`

const terraformDocs = `# Terraform Troubleshooting Runbook

A comprehensive guide for troubleshooting common Terraform issues.

## State File Issues

### State File Locked

\`\`\`bash
terraform force-unlock <lock-id>
\`\`\`

### State Drift

\`\`\`bash
terraform plan -refresh-only
terraform apply -refresh-only
\`\`\`

## Provider Issues

### Provider Version Conflicts

\`\`\`hcl
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}
\`\`\`

## Import Resources

\`\`\`bash
terraform import aws_instance.example i-1234567890abcdef0
terraform import aws_s3_bucket.example my-bucket-name
\`\`\`

## Performance

\`\`\`bash
terraform apply -parallelism=5
terraform apply -target=module.vpc
terraform plan -refresh=false
\`\`\`

## Best Practices

\`\`\`bash
terraform plan -out=plan.out
terraform apply plan.out
terraform state pull > backup-$(date +%Y%m%d-%H%M%S).tfstate
\`\`\`
`

const argoCDDocs = `# ArgoCD Deployment Guide

Complete guide for deploying and managing applications with ArgoCD.

## What is ArgoCD?

ArgoCD is a declarative, GitOps continuous delivery tool for Kubernetes. It continuously monitors your Git repository and automatically syncs the desired state to your cluster.

## Installation

### Quick Install

\`\`\`bash
# Create namespace
kubectl create namespace argocd

# Install ArgoCD
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Wait for pods to be ready
kubectl wait --for=condition=available --timeout=300s deployment/argocd-server -n argocd
\`\`\`

### Access ArgoCD UI

\`\`\`bash
# Port forward to access UI
kubectl port-forward svc/argocd-server -n argocd 8080:443

# Get initial admin password
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d

# Login via CLI
argocd login localhost:8080
argocd account update-password
\`\`\`

### Install ArgoCD CLI

\`\`\`bash
# macOS
brew install argocd

# Linux
curl -sSL -o /usr/local/bin/argocd https://github.com/argoproj/argo-cd/releases/latest/download/argocd-linux-amd64
chmod +x /usr/local/bin/argocd
\`\`\`

## Creating Applications

### Method 1: Using CLI

\`\`\`bash
argocd app create peii-app \\
  --repo https://github.com/yourorg/peii \\
  --path . \\
  --dest-server https://kubernetes.default.svc \\
  --dest-namespace production \\
  --helm-set image.tag=v1.0.0
\`\`\`

### Method 2: Using Application Manifest

\`\`\`yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: peii-app
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/yourorg/peii
    targetRevision: HEAD
    path: .
    helm:
      valueFiles:
        - values.yaml
      parameters:
        - name: image.tag
          value: v1.2.3
        - name: replicaCount
          value: "3"
  destination:
    server: https://kubernetes.default.svc
    namespace: production
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
      allowEmpty: false
    syncOptions:
      - CreateNamespace=true
    retry:
      limit: 5
      backoff:
        duration: 5s
        factor: 2
        maxDuration: 3m
\`\`\`

\`\`\`bash
kubectl apply -f argocd-app.yaml
\`\`\`

## Sync Policies

### Manual Sync
\`\`\`yaml
syncPolicy: {}
\`\`\`

### Automated Sync
\`\`\`yaml
syncPolicy:
  automated:
    prune: true      # Delete resources not in Git
    selfHeal: true   # Force sync when cluster state changes
\`\`\`

## Managing Applications

### Sync Application
\`\`\`bash
# Manual sync
argocd app sync peii-app

# Sync specific resource
argocd app sync peii-app --resource apps:Deployment:myapp

# Dry run
argocd app sync peii-app --dry-run
\`\`\`

### Check Status
\`\`\`bash
argocd app get peii-app
argocd app list
argocd app diff peii-app
\`\`\`

### View Logs
\`\`\`bash
argocd app logs peii-app
argocd app logs peii-app --follow
\`\`\`

### Rollback
\`\`\`bash
# List history
argocd app history peii-app

# Rollback to specific revision
argocd app rollback peii-app 3
\`\`\`

### Delete Application
\`\`\`bash
# Delete app but keep resources
argocd app delete peii-app

# Delete app and all resources
argocd app delete peii-app --cascade
\`\`\`

## Projects and RBAC

### Create Project
\`\`\`yaml
apiVersion: argoproj.io/v1alpha1
kind: AppProject
metadata:
  name: production
  namespace: argocd
spec:
  description: Production applications
  sourceRepos:
    - 'https://github.com/yourorg/*'
  destinations:
    - namespace: 'prod-*'
      server: https://kubernetes.default.svc
  clusterResourceWhitelist:
    - group: '*'
      kind: '*'
\`\`\`

## Multi-Environment Setup

### Dev Environment
\`\`\`yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: peii-dev
  namespace: argocd
spec:
  source:
    repoURL: https://github.com/yourorg/peii
    path: .
    helm:
      valueFiles:
        - values-dev.yaml
  destination:
    namespace: dev
\`\`\`

### Prod Environment
\`\`\`yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: peii-prod
  namespace: argocd
spec:
  source:
    repoURL: https://github.com/yourorg/peii
    path: .
    helm:
      valueFiles:
        - values-prod.yaml
  destination:
    namespace: prod
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
\`\`\`

## Health Checks

### Custom Health Check
\`\`\`yaml
data:
  resource.customizations: |
    argoproj.io/Application:
      health.lua: |
        hs = {}
        if obj.status.health.status == "Healthy" then
          hs.status = "Healthy"
        else
          hs.status = "Degraded"
        end
        return hs
\`\`\`

## Troubleshooting

### Application Not Syncing
\`\`\`bash
# Check app status
argocd app get peii-app

# Check sync status
kubectl get application peii-app -n argocd -o yaml

# Force sync
argocd app sync peii-app --force
\`\`\`

### Out of Sync
\`\`\`bash
# Show differences
argocd app diff peii-app

# Ignore differences
kubectl patch app peii-app -n argocd --type merge -p '
{
  "spec": {
    "ignoreDifferences": [
      {
        "group": "apps",
        "kind": "Deployment",
        "jsonPointers": ["/spec/replicas"]
      }
    ]
  }
}'
\`\`\`

### Permission Issues
\`\`\`bash
# Check ArgoCD server logs
kubectl logs -n argocd deployment/argocd-server

# Check repo server logs
kubectl logs -n argocd deployment/argocd-repo-server
\`\`\`

## Best Practices

1. **Use Projects** - Organize apps by team/environment
2. **Enable Automated Sync** - For non-prod environments
3. **Use Sync Waves** - Control deployment order
4. **Health Checks** - Define custom health checks
5. **RBAC** - Restrict access by project
6. **Notifications** - Set up alerts for sync failures
7. **Resource Hooks** - Use PreSync/PostSync hooks

## Notifications Setup

\`\`\`yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: argocd-notifications-cm
  namespace: argocd
data:
  trigger.on-sync-failed: |
    - when: app.status.operationState.phase in ['Error', 'Failed']
      send: [app-sync-failed]
  template.app-sync-failed: |
    message: Application {{.app.metadata.name}} sync failed!
    slack:
      attachments: |
        [{
          "title": "{{.app.metadata.name}}",
          "color": "danger"
        }]
\`\`\`

## Useful Commands

\`\`\`bash
# Watch app status
argocd app wait peii-app

# Set app parameters
argocd app set peii-app --helm-set image.tag=v2.0.0

# Enable auto-sync
argocd app set peii-app --sync-policy automated

# View resource tree
argocd app resources peii-app

# Sync with prune
argocd app sync peii-app --prune
\`\`\`
`

const gitopsCIDocs = `# GitOps CI/CD Pipeline Guide

Complete guide for setting up GitOps-based CI/CD pipelines.

## What is GitOps?

GitOps uses Git as the single source of truth for declarative infrastructure and applications. Changes are made via pull requests, and automation handles deployment.

## Core Principles

1. **Declarative** - Everything is declared in Git
2. **Versioned** - Git history tracks all changes
3. **Immutable** - Changes create new versions
4. **Pulled** - Agents pull from Git, not pushed
5. **Reconciled** - Desired state constantly synced

## GitHub Actions CI/CD

### Build and Push Image

\`\`\`yaml
name: Build and Deploy
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2
      
      - name: Login to Registry
        uses: docker/login-action@v2
        with:
          registry: ghcr.io
          username: \${{ github.actor }}
          password: \${{ secrets.GITHUB_TOKEN }}
      
      - name: Build and push
        uses: docker/build-push-action@v4
        with:
          context: .
          push: true
          tags: |
            ghcr.io/\${{ github.repository }}:\${{ github.sha }}
            ghcr.io/\${{ github.repository }}:latest
          cache-from: type=gha
          cache-to: type=gha,mode=max

  update-gitops:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Checkout GitOps repo
        uses: actions/checkout@v3
        with:
          repository: yourorg/gitops-repo
          token: \${{ secrets.GITOPS_TOKEN }}
      
      - name: Update image tag
        run: |
          sed -i 's|image: .*|image: ghcr.io/\${{ github.repository }}:\${{ github.sha }}|' values.yaml
          git config user.name "GitHub Actions"
          git config user.email "actions@github.com"
          git add values.yaml
          git commit -m "Update image to \${{ github.sha }}"
          git push
\`\`\`

### Helm Chart Deployment

\`\`\`yaml
name: Deploy with Helm
on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment'
        required: true
        type: choice
        options:
          - dev
          - staging
          - prod

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: \${{ github.event.inputs.environment }}
    steps:
      - uses: actions/checkout@v3
      
      - name: Configure kubectl
        uses: azure/k8s-set-context@v3
        with:
          method: kubeconfig
          kubeconfig: \${{ secrets.KUBE_CONFIG }}
      
      - name: Install Helm
        uses: azure/setup-helm@v3
      
      - name: Deploy
        run: |
          helm upgrade --install peii-app . \\
            --namespace \${{ github.event.inputs.environment }} \\
            --create-namespace \\
            --values values-\${{ github.event.inputs.environment }}.yaml \\
            --set image.tag=\${{ github.sha }} \\
            --wait
\`\`\`

## GitLab CI/CD

\`\`\`yaml
stages:
  - build
  - test
  - deploy

variables:
  DOCKER_IMAGE: \${CI_REGISTRY_IMAGE}:\${CI_COMMIT_SHA}

build:
  stage: build
  image: docker:latest
  services:
    - docker:dind
  script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
    - docker build -t $DOCKER_IMAGE .
    - docker push $DOCKER_IMAGE
    - docker tag $DOCKER_IMAGE \${CI_REGISTRY_IMAGE}:latest
    - docker push \${CI_REGISTRY_IMAGE}:latest

test:
  stage: test
  image: $DOCKER_IMAGE
  script:
    - npm test
    - npm run lint

deploy-dev:
  stage: deploy
  image: alpine/helm:latest
  script:
    - helm upgrade --install peii-app . \\
        --namespace dev \\
        --create-namespace \\
        --set image.tag=$CI_COMMIT_SHA \\
        --wait
  only:
    - develop

deploy-prod:
  stage: deploy
  image: alpine/helm:latest
  script:
    - helm upgrade --install peii-app . \\
        --namespace prod \\
        --set image.tag=$CI_COMMIT_SHA \\
        --wait
  only:
    - main
  when: manual
\`\`\`

## Jenkins Pipeline

\`\`\`groovy
pipeline {
  agent any
  
  environment {
    REGISTRY = 'ghcr.io'
    IMAGE_NAME = 'yourorg/peii'
    IMAGE_TAG = "\${env.GIT_COMMIT.take(7)}"
  }
  
  stages {
    stage('Build') {
      steps {
        script {
          docker.build("\${REGISTRY}/\${IMAGE_NAME}:\${IMAGE_TAG}")
        }
      }
    }
    
    stage('Push') {
      steps {
        script {
          docker.withRegistry("https://\${REGISTRY}", 'github-credentials') {
            docker.image("\${REGISTRY}/\${IMAGE_NAME}:\${IMAGE_TAG}").push()
            docker.image("\${REGISTRY}/\${IMAGE_NAME}:\${IMAGE_TAG}").push('latest')
          }
        }
      }
    }
    
    stage('Deploy to Dev') {
      when { branch 'develop' }
      steps {
        sh """
          helm upgrade --install peii-app . \\
            --namespace dev \\
            --set image.tag=\${IMAGE_TAG} \\
            --wait
        """
      }
    }
    
    stage('Deploy to Prod') {
      when { branch 'main' }
      steps {
        input message: 'Deploy to production?'
        sh """
          helm upgrade --install peii-app . \\
            --namespace prod \\
            --set image.tag=\${IMAGE_TAG} \\
            --wait
        """
      }
    }
  }
}
\`\`\`

## Repository Structure

### Mono-repo Approach
\`\`\`
repo/
├── app/                    # Application code
├── Dockerfile
├── charts/
│   └── peii/              # Helm chart
│       ├── Chart.yaml
│       ├── values.yaml
│       └── templates/
└── .github/workflows/     # CI/CD pipelines
\`\`\`

### Multi-repo Approach
\`\`\`
app-repo/                  # Application code
├── app/
├── Dockerfile
└── .github/workflows/

gitops-repo/               # GitOps configuration
├── apps/
│   ├── dev/
│   │   └── values.yaml
│   ├── staging/
│   │   └── values.yaml
│   └── prod/
│       └── values.yaml
└── charts/
    └── peii/
\`\`\`

## Environment Promotion

### Automatic Dev, Manual Prod

\`\`\`yaml
# Deploy to dev automatically
deploy-dev:
  if: github.ref == 'refs/heads/develop'
  runs-on: ubuntu-latest
  steps:
    - name: Deploy to Dev
      run: |
        argocd app sync peii-dev

# Deploy to prod manually
deploy-prod:
  if: github.ref == 'refs/heads/main'
  runs-on: ubuntu-latest
  environment:
    name: production
    url: https://peii.example.com
  steps:
    - name: Deploy to Prod
      run: |
        argocd app sync peii-prod
\`\`\`

## Progressive Delivery

### Canary Deployment with Argo Rollouts

\`\`\`yaml
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: peii-rollout
spec:
  replicas: 5
  strategy:
    canary:
      steps:
        - setWeight: 20
        - pause: {duration: 5m}
        - setWeight: 40
        - pause: {duration: 5m}
        - setWeight: 60
        - pause: {duration: 5m}
        - setWeight: 80
        - pause: {duration: 5m}
  template:
    spec:
      containers:
        - name: peii
          image: ghcr.io/yourorg/peii:latest
\`\`\`

## Secret Management

### Sealed Secrets

\`\`\`bash
# Install sealed-secrets controller
kubectl apply -f https://github.com/bitnami-labs/sealed-secrets/releases/download/v0.24.0/controller.yaml

# Seal a secret
kubectl create secret generic db-creds \\
  --from-literal=username=admin \\
  --from-literal=password=secret123 \\
  --dry-run=client -o yaml | \\
  kubeseal -o yaml > sealed-secret.yaml

# Commit sealed-secret.yaml to Git
git add sealed-secret.yaml
git commit -m "Add database credentials"
\`\`\`

### External Secrets Operator

\`\`\`yaml
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: db-credentials
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: aws-secretsmanager
    kind: SecretStore
  target:
    name: db-creds
  data:
    - secretKey: username
      remoteRef:
        key: prod/database
        property: username
    - secretKey: password
      remoteRef:
        key: prod/database
        property: password
\`\`\`

## Monitoring and Alerts

### Prometheus + Grafana

\`\`\`yaml
# Add to CI/CD
- name: Check deployment health
  run: |
    kubectl rollout status deployment/peii-app -n prod --timeout=5m
    
    # Check metrics
    CURRENT_REPLICAS=$(kubectl get deployment peii-app -n prod -o jsonpath='{.status.readyReplicas}')
    if [ "$CURRENT_REPLICAS" -lt "2" ]; then
      echo "Not enough replicas ready"
      exit 1
    fi
\`\`\`

## Rollback Strategy

\`\`\`yaml
# Automatic rollback on failure
- name: Deploy with auto-rollback
  run: |
    helm upgrade peii-app . \\
      --namespace prod \\
      --set image.tag=\${{ github.sha }} \\
      --wait \\
      --timeout 5m \\
      --atomic  # Rollback on failure
\`\`\`

## Best Practices

1. **Separate repos** - Keep app code and config separate
2. **Pull requests** - All changes via PR with approvals
3. **Branch protection** - Require reviews for main/prod
4. **Image tags** - Use commit SHA, not :latest
5. **Smoke tests** - Verify deployment health
6. **Gradual rollout** - Use canary or blue/green
7. **Automatic rollback** - On failure detection
8. **Secret management** - Never commit secrets
9. **Drift detection** - Alert on manual changes
10. **Audit trail** - Git provides full history

## Useful Commands

\`\`\`bash
# Check deployment status
kubectl rollout status deployment/peii-app -n prod

# View rollout history
kubectl rollout history deployment/peii-app -n prod

# Rollback deployment
kubectl rollout undo deployment/peii-app -n prod

# Check image in deployment
kubectl get deployment peii-app -n prod -o jsonpath='{.spec.template.spec.containers[0].image}'

# Force new rollout
kubectl rollout restart deployment/peii-app -n prod
\`\`\`
`

// Template files
const templates = {
  deployment: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "peii.fullname" . }}
  labels:
    {{- include "peii.labels" . | nindent 4 }}
spec:
  {{- if not .Values.autoscaling.enabled }}
  replicas: {{ .Values.replicaCount }}
  {{- end }}
  selector:
    matchLabels:
      {{- include "peii.selectorLabels" . | nindent 6 }}
  template:
    metadata:
      {{- with .Values.podAnnotations }}
      annotations:
        {{- toYaml . | nindent 8 }}
      {{- end }}
      labels:
        {{- include "peii.selectorLabels" . | nindent 8 }}
    spec:
      {{- with .Values.imagePullSecrets }}
      imagePullSecrets:
        {{- toYaml . | nindent 8 }}
      {{- end }}
      serviceAccountName: {{ include "peii.serviceAccountName" . }}
      securityContext:
        {{- toYaml .Values.podSecurityContext | nindent 8 }}
      containers:
      - name: {{ .Chart.Name }}
        securityContext:
          {{- toYaml .Values.securityContext | nindent 12 }}
        image: "{{ .Values.image.repository }}:{{ .Values.image.tag | default .Chart.AppVersion }}"
        imagePullPolicy: {{ .Values.image.pullPolicy }}
        ports:
        - name: http
          containerPort: {{ .Values.service.targetPort }}
          protocol: TCP
        livenessProbe:
          {{- toYaml .Values.livenessProbe | nindent 12 }}
        readinessProbe:
          {{- toYaml .Values.readinessProbe | nindent 12 }}
        resources:
          {{- toYaml .Values.resources | nindent 12 }}
        {{- with .Values.env }}
        env:
          {{- toYaml . | nindent 12 }}
        {{- end }}
        {{- with .Values.envFrom }}
        envFrom:
          {{- toYaml . | nindent 12 }}
        {{- end }}
      {{- with .Values.nodeSelector }}
      nodeSelector:
        {{- toYaml . | nindent 8 }}
      {{- end }}
      {{- with .Values.affinity }}
      affinity:
        {{- toYaml . | nindent 8 }}
      {{- end }}
      {{- with .Values.tolerations }}
      tolerations:
        {{- toYaml . | nindent 8 }}
      {{- end }}`,

  service: `apiVersion: v1
kind: Service
metadata:
  name: {{ include "peii.fullname" . }}
  labels:
    {{- include "peii.labels" . | nindent 4 }}
spec:
  type: {{ .Values.service.type }}
  ports:
    - port: {{ .Values.service.port }}
      targetPort: http
      protocol: TCP
      name: http
  selector:
    {{- include "peii.selectorLabels" . | nindent 4 }}`,

  ingress: `{{- if .Values.ingress.enabled -}}
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: {{ include "peii.fullname" . }}
  labels:
    {{- include "peii.labels" . | nindent 4 }}
  {{- with .Values.ingress.annotations }}
  annotations:
    {{- toYaml . | nindent 4 }}
  {{- end }}
spec:
  {{- if .Values.ingress.className }}
  ingressClassName: {{ .Values.ingress.className }}
  {{- end }}
  {{- if .Values.ingress.tls }}
  tls:
    {{- range .Values.ingress.tls }}
    - hosts:
        {{- range .hosts }}
        - {{ . | quote }}
        {{- end }}
      secretName: {{ .secretName }}
    {{- end }}
  {{- end }}
  rules:
    {{- range .Values.ingress.hosts }}
    - host: {{ .host | quote }}
      http:
        paths:
          {{- range .paths }}
          - path: {{ .path }}
            pathType: {{ .pathType }}
            backend:
              service:
                name: {{ include "peii.fullname" $ }}
                port:
                  number: {{ $.Values.service.port }}
          {{- end }}
    {{- end }}
{{- end }}`,

  hpa: `{{- if .Values.autoscaling.enabled }}
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: {{ include "peii.fullname" . }}
  labels:
    {{- include "peii.labels" . | nindent 4 }}
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: {{ include "peii.fullname" . }}
  minReplicas: {{ .Values.autoscaling.minReplicas }}
  maxReplicas: {{ .Values.autoscaling.maxReplicas }}
  metrics:
    {{- if .Values.autoscaling.targetCPUUtilizationPercentage }}
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: {{ .Values.autoscaling.targetCPUUtilizationPercentage }}
    {{- end }}
    {{- if .Values.autoscaling.targetMemoryUtilizationPercentage }}
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: {{ .Values.autoscaling.targetMemoryUtilizationPercentage }}
    {{- end }}
{{- end }}`,

  serviceaccount: `{{- if .Values.serviceAccount.create -}}
apiVersion: v1
kind: ServiceAccount
metadata:
  name: {{ include "peii.serviceAccountName" . }}
  labels:
    {{- include "peii.labels" . | nindent 4 }}
  {{- with .Values.serviceAccount.annotations }}
  annotations:
    {{- toYaml . | nindent 4 }}
  {{- end }}
{{- end }}`,

  helpers: `{{/*
Expand the name of the chart.
*/}}
{{- define "peii.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "peii.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "peii.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "peii.labels" -}}
helm.sh/chart: {{ include "peii.chart" . }}
{{ include "peii.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "peii.selectorLabels" -}}
app.kubernetes.io/name: {{ include "peii.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "peii.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "peii.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}`,
}

type TabType = 'helm' | 'kubernetes' | 'terraform' | 'argocd' | 'gitops' | 'templates'
type TemplateType = 'deployment' | 'service' | 'ingress' | 'hpa' | 'serviceaccount' | 'helpers'

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('helm')
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTemplate, setActiveTemplate] = useState<TemplateType>('deployment')
  const [editedTemplate, setEditedTemplate] = useState('')
  const [isEditing, setIsEditing] = useState(false)

  const docs = {
    helm: helmChartDocs,
    kubernetes: kubernetesDocs,
    terraform: terraformDocs,
    argocd: argoCDDocs,
    gitops: gitopsCIDocs,
  }

  const currentDoc = activeTab === 'templates' ? '' : docs[activeTab as keyof typeof docs]
  
  // Enhanced search that finds sections containing the search term
  const getFilteredContent = () => {
    if (!searchTerm || activeTab === 'templates') return currentDoc
    
    const lowerSearch = searchTerm.toLowerCase()
    const sections = currentDoc.split('\n## ')
    
    // Search through all content including titles and body
    const matchingSections = sections.filter(section => 
      section.toLowerCase().includes(lowerSearch)
    )
    
    if (matchingSections.length === 0) {
      return `# No results found for "${searchTerm}"\n\nTry searching for:\n- Command names (kubectl, helm, terraform)\n- Error messages\n- Resource types (pod, service, deployment)\n- Keywords (crash, sync, deploy)`
    }
    
    // Reconstruct the document with matching sections
    return matchingSections.map((section, index) => 
      index === 0 ? section : '## ' + section
    ).join('\n')
  }
  
  const filteredContent = getFilteredContent()

  const handleTemplateChange = (template: TemplateType) => {
    setActiveTemplate(template)
    setEditedTemplate(templates[template])
    setIsEditing(false)
  }

  const handleDownload = () => {
    const filename = activeTemplate === 'helpers' ? '_helpers.tpl' : `${activeTemplate}.yaml`
    const content = isEditing ? editedTemplate : templates[activeTemplate]
    const blob = new Blob([content], { type: 'text/yaml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleCopy = () => {
    const content = isEditing ? editedTemplate : templates[activeTemplate]
    navigator.clipboard.writeText(content)
  }

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'helm', label: 'Helm Chart', icon: '🚢' },
    { id: 'kubernetes', label: 'Kubernetes', icon: '☸️' },
    { id: 'terraform', label: 'Terraform', icon: '🏗️' },
    { id: 'argocd', label: 'ArgoCD', icon: '🔄' },
    { id: 'gitops', label: 'GitOps CI', icon: '🚀' },
    { id: 'templates', label: 'Templates', icon: '📝' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                On Call Runbook
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Your Essential DevOps & Kubernetes Troubleshooting Guide
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                v1.0.0
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        {activeTab !== 'templates' && (
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search commands, errors, or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pr-24 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 px-3 py-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
            {searchTerm && (
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                🔍 Searching for: <span className="font-semibold text-blue-600 dark:text-blue-400">{searchTerm}</span>
              </div>
            )}
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex -mb-px overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="p-8 overflow-y-auto max-h-[calc(100vh-300px)]">
            {activeTab === 'templates' ? (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Helm Chart Templates
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    View and edit your Helm chart templates. Click on any template to view or edit it.
                  </p>
                  
                  {/* Template selector */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {Object.keys(templates).map((template) => (
                      <button
                        key={template}
                        onClick={() => handleTemplateChange(template as TemplateType)}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          activeTemplate === template
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                      >
                        {template === 'helpers' ? '_helpers.tpl' : `${template}.yaml`}
                      </button>
                    ))}
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={() => {
                        setIsEditing(!isEditing)
                        if (!isEditing) {
                          setEditedTemplate(templates[activeTemplate])
                        }
                      }}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium transition-colors"
                    >
                      {isEditing ? '👁️ View Mode' : '✏️ Edit Mode'}
                    </button>
                    <button
                      onClick={handleCopy}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors"
                    >
                      📋 Copy
                    </button>
                    <button
                      onClick={handleDownload}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-sm font-medium transition-colors"
                    >
                      ⬇️ Download
                    </button>
                  </div>
                </div>

                {/* Template content */}
                {isEditing ? (
                  <textarea
                    value={editedTemplate}
                    onChange={(e) => setEditedTemplate(e.target.value)}
                    className="w-full h-[600px] p-4 font-mono text-sm bg-gray-900 text-gray-100 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    spellCheck={false}
                  />
                ) : (
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                    <code>{templates[activeTemplate]}</code>
                  </pre>
                )}
              </div>
            ) : (
              <div className="markdown prose prose-slate dark:prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {filteredContent}
                </ReactMarkdown>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>🚨 Made with ❤️ for On-Call Engineers • Your 3 AM Best Friend</p>
        </footer>
      </div>
    </div>
  )
}
