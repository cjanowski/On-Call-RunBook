'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const helmChartDocs = `# PEII Helm Chart

A Helm chart for deploying applications on Kubernetes.

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

The following table lists the configurable parameters of the PEII chart and their default values.

| Parameter | Description | Default |
|-----------|-------------|---------|
| \`replicaCount\` | Number of replicas | \`2\` |
| \`image.repository\` | Image repository | \`nginx\` |
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

### Upgrade deployment

\`\`\`bash
helm upgrade my-release . --set image.tag=v1.1.0
\`\`\`

## CD Integration

### GitHub Actions

\`\`\`yaml
- name: Deploy with Helm
  run: |
    helm upgrade --install my-release ./chart \\
      --set image.tag=\${{ github.sha }} \\
      --wait
\`\`\`

### GitLab CI

\`\`\`yaml
deploy:
  stage: deploy
  script:
    - helm upgrade --install my-release ./chart
        --set image.tag=$CI_COMMIT_SHA
        --wait
\`\`\`

### ArgoCD

Create an Application manifest:

\`\`\`yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: peii
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
  destination:
    server: https://kubernetes.default.svc
    namespace: production
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
\`\`\`
`

const kubernetesDocs = `# Kubernetes Troubleshooting Runbook
A comprehensive guide for troubleshooting common Kubernetes issues.

## Table of Contents
- [Pod Issues](#pod-issues)
- [Service and Networking](#service-and-networking)
- [Storage Issues](#storage-issues)
- [Node Issues](#node-issues)
- [Resource Limits](#resource-limits)
- [RBAC and Security](#rbac-and-security)
- [Performance Issues](#performance-issues)
- [Cluster Health](#cluster-health)

---

## Pod Issues

### Pod Not Starting / CrashLoopBackOff

**Diagnosis:**
\`\`\`bash
# Check pod status
kubectl get pods -n <namespace>

# Describe pod for events
kubectl describe pod <pod-name> -n <namespace>

# Check logs (current container)
kubectl logs <pod-name> -n <namespace>

# Check logs (previous container if crashed)
kubectl logs <pod-name> -n <namespace> --previous

# Check all containers in a pod
kubectl logs <pod-name> -n <namespace> --all-containers=true

# Follow logs in real-time
kubectl logs -f <pod-name> -n <namespace>
\`\`\`

**Common Causes:**
- Image pull errors
- Missing secrets/configmaps
- Resource limits too low
- Application errors
- Failed health checks

**Solutions:**
\`\`\`bash
# Check image pull issues
kubectl describe pod <pod-name> -n <namespace> | grep -A 10 "Events:"

# Verify image exists
docker pull <image>:<tag>

# Check secrets exist
kubectl get secrets -n <namespace>

# Check configmaps exist
kubectl get configmaps -n <namespace>

# Temporarily remove health checks to debug
kubectl edit deployment <deployment-name> -n <namespace>
# Comment out livenessProbe and readinessProbe sections
\`\`\`

### ImagePullBackOff

**Diagnosis:**
\`\`\`bash
kubectl describe pod <pod-name> -n <namespace>
kubectl get events -n <namespace> --sort-by='.lastTimestamp'
\`\`\`

**Solutions:**
\`\`\`bash
# Check image pull secrets
kubectl get secrets -n <namespace>
kubectl describe secret <secret-name> -n <namespace>

# Create image pull secret if missing
kubectl create secret docker-registry regcred \\
  --docker-server=<registry-url> \\
  --docker-username=<username> \\
  --docker-password=<password> \\
  --docker-email=<email> \\
  -n <namespace>

# Verify image exists and tag is correct
docker pull <image>:<tag>

# Check if imagePullSecrets is referenced in deployment
kubectl get deployment <deployment-name> -n <namespace> -o yaml | grep imagePullSecrets
\`\`\`

### Pod Pending State

**Diagnosis:**
\`\`\`bash
kubectl describe pod <pod-name> -n <namespace>
kubectl get events -n <namespace> --field-selector involvedObject.name=<pod-name>
\`\`\`

**Common Causes:**
- Insufficient resources
- Node selector mismatch
- Taints and tolerations
- PVC binding issues

**Solutions:**
\`\`\`bash
# Check node resources
kubectl top nodes
kubectl describe nodes
  
# Check pod resource requests
kubectl describe pod <pod-name> -n <namespace> | grep -A 5 "Requests:"

# Check for node selectors
kubectl get pod <pod-name> -n <namespace> -o yaml | grep -A 3 nodeSelector

# Check taints on nodes
kubectl describe nodes | grep Taints

# Check PVC status
kubectl get pvc -n <namespace>
\`\`\`

### OOMKilled (Out of Memory)

**Diagnosis:**
\`\`\`bash
# Check pod restart reason
kubectl describe pod <pod-name> -n <namespace> | grep -A 10 "Last State"

# Check resource usage
kubectl top pod <pod-name> -n <namespace>

# Get detailed memory stats
kubectl exec <pod-name> -n <namespace> -- cat /sys/fs/cgroup/memory/memory.usage_in_bytes
\`\`\`

**Solutions:**
\`\`\`bash
# Increase memory limits
kubectl edit deployment <deployment-name> -n <namespace>
# Update resources.limits.memory

# Or patch directly
kubectl patch deployment <deployment-name> -n <namespace> -p \\
  '{"spec":{"template":{"spec":{"containers":[{"name":"<container-name>","resources":{"limits":{"memory":"1Gi"}}}]}}}}'
\`\`\`

---

## Service and Networking

### Service Not Reachable

**Diagnosis:**
\`\`\`bash
# Check service
kubectl get svc -n <namespace>
kubectl describe svc <service-name> -n <namespace>

# Check endpoints
kubectl get endpoints <service-name> -n <namespace>

# Check if pods match service selector
kubectl get pods -n <namespace> --show-labels
kubectl get svc <service-name> -n <namespace> -o yaml | grep selector

# Test from within cluster
kubectl run tmp-shell --rm -i --tty --image nicolaka/netshoot -- /bin/bash
# Then inside: curl <service-name>.<namespace>.svc.cluster.local
\`\`\`

**Solutions:**
\`\`\`bash
# Verify selector matches pod labels
kubectl get svc <service-name> -n <namespace> -o jsonpath='{.spec.selector}'
kubectl get pods -n <namespace> -l <key>=<value>

# Check if pods are ready
kubectl get pods -n <namespace> -o wide

# Verify port configuration
kubectl get svc <service-name> -n <namespace> -o yaml
\`\`\`

### DNS Issues

**Diagnosis:**
\`\`\`bash
# Check CoreDNS pods
kubectl get pods -n kube-system -l k8s-app=kube-dns

# Check CoreDNS logs
kubectl logs -n kube-system -l k8s-app=kube-dns

# Test DNS resolution
kubectl run tmp-shell --rm -i --tty --image nicolaka/netshoot -- /bin/bash
nslookup kubernetes.default
nslookup <service-name>.<namespace>.svc.cluster.local
\`\`\`

**Solutions:**
\`\`\`bash
# Restart CoreDNS
kubectl rollout restart deployment coredns -n kube-system

# Check CoreDNS configmap
kubectl get configmap coredns -n kube-system -o yaml

# Verify cluster DNS is set correctly
kubectl run tmp-shell --rm -i --tty --image nicolaka/netshoot -- cat /etc/resolv.conf
\`\`\`

### Ingress Not Working

**Diagnosis:**
\`\`\`bash
# Check ingress
kubectl get ingress -n <namespace>
kubectl describe ingress <ingress-name> -n <namespace>

# Check ingress controller
kubectl get pods -n ingress-nginx
kubectl logs -n ingress-nginx <ingress-controller-pod>

# Verify backend service
kubectl get svc -n <namespace>
kubectl get endpoints -n <namespace>
\`\`\`

**Solutions:**
\`\`\`bash
# Check ingress class
kubectl get ingressclass

# Verify TLS secret exists
kubectl get secret <tls-secret-name> -n <namespace>

# Test backend directly
kubectl port-forward svc/<service-name> 8080:80 -n <namespace>

# Check ingress annotations
kubectl get ingress <ingress-name> -n <namespace> -o yaml | grep annotations -A 10
\`\`\`

---

## Storage Issues

### PVC Pending

**Diagnosis:**
\`\`\`bash
# Check PVC status
kubectl get pvc -n <namespace>
kubectl describe pvc <pvc-name> -n <namespace>

# Check storage classes
kubectl get storageclass
kubectl describe storageclass <storage-class-name>

# Check PV
kubectl get pv
\`\`\`

**Solutions:**
\`\`\`bash
# Verify storage class exists
kubectl get storageclass

# Check if dynamic provisioning is enabled
kubectl describe storageclass <storage-class-name> | grep Provisioner
\`\`\`

---

## Quick Reference

\`\`\`bash
# Get all resources in namespace
kubectl get all -n <namespace>

# Watch resources
kubectl get pods -n <namespace> -w

# Force delete pod
kubectl delete pod <pod-name> -n <namespace> --grace-period=0 --force

# Scale deployment
kubectl scale deployment <deployment-name> -n <namespace> --replicas=3

# Rollout status
kubectl rollout status deployment/<deployment-name> -n <namespace>

# Rollback
kubectl rollout undo deployment/<deployment-name> -n <namespace>
\`\`\`
`

const terraformDocs = `# Terraform Troubleshooting Runbook

A comprehensive guide for troubleshooting common Terraform issues.

## Table of Contents

- [State File Issues](#state-file-issues)
- [Provider Issues](#provider-issues)
- [Resource Drift](#resource-drift)
- [Plan and Apply Errors](#plan-and-apply-errors)
- [Import Issues](#import-issues)
- [Module Issues](#module-issues)
- [Performance Issues](#performance-issues)
- [Workspace Issues](#workspace-issues)

---

## State File Issues

### State File Locked

**Error:**
\`\`\`
Error: Error acquiring the state lock
\`\`\`

**Diagnosis:**
\`\`\`bash
# Check state lock info
terraform force-unlock <lock-id>

# For S3 backend, check DynamoDB
aws dynamodb get-item \\
  --table-name terraform-state-lock \\
  --key '{"LockID":{"S":"<state-file-path>"}}'
\`\`\`

**Solutions:**
\`\`\`bash
# Force unlock (use with caution)
terraform force-unlock <lock-id>

# For S3/DynamoDB backend
aws dynamodb delete-item \\
  --table-name terraform-state-lock \\
  --key '{"LockID":{"S":"<state-file-path>"}}'
\`\`\`

### State File Corrupted

**Diagnosis:**
\`\`\`bash
# Validate state
terraform show

# List resources in state
terraform state list

# Check state file integrity
cat terraform.tfstate | jq .
\`\`\`

**Solutions:**
\`\`\`bash
# Pull current state
terraform state pull > backup.tfstate

# Restore from backup
terraform state push backup.tfstate

# For remote backend (S3)
aws s3 cp s3://bucket/path/terraform.tfstate backup.tfstate
aws s3 cp backup.tfstate s3://bucket/path/terraform.tfstate
\`\`\`

### State Drift

**Diagnosis:**
\`\`\`bash
# Check for drift
terraform plan -refresh-only

# Show current state
terraform show

# Compare with actual infrastructure
terraform refresh
terraform plan
\`\`\`

**Solutions:**
\`\`\`bash
# Update state to match reality
terraform apply -refresh-only

# Ignore drift for specific resources
lifecycle {
  ignore_changes = [
    tags,
    last_modified_date
  ]
}
\`\`\`

---

## Provider Issues

### Provider Version Conflicts

**Error:**
\`\`\`
Error: Incompatible provider version
\`\`\`

**Diagnosis:**
\`\`\`bash
# Check provider versions
terraform version
terraform providers

# Check required providers
cat .terraform.lock.hcl
\`\`\`

**Solutions:**
\`\`\`bash
# Lock provider versions
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# Update providers
terraform init -upgrade

# Reconfigure providers
terraform init -reconfigure
\`\`\`

### Provider Authentication Issues

**Solutions:**
\`\`\`bash
# Set AWS credentials
export AWS_ACCESS_KEY_ID="<access-key>"
export AWS_SECRET_ACCESS_KEY="<secret-key>"
export AWS_DEFAULT_REGION="us-east-1"

# Use AWS profile
export AWS_PROFILE=<profile-name>

# For GCP
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/key.json"

# For Azure
az login
\`\`\`

---

## Plan and Apply Errors

### Dependency Issues

**Error:**
\`\`\`
Error: Cycle in resource dependencies
\`\`\`

**Solutions:**
\`\`\`bash
# Generate dependency graph
terraform graph | dot -Tpng > graph.png

# Explicit dependencies
resource "aws_instance" "example" {
  depends_on = [aws_security_group.example]
}
\`\`\`

### Resource Already Exists

**Solutions:**
\`\`\`bash
# Import existing resource
terraform import <resource-address> <resource-id>

# Examples:
terraform import aws_instance.example i-1234567890abcdef0
terraform import aws_s3_bucket.example my-bucket-name
terraform import aws_vpc.example vpc-12345678
\`\`\`

### Timeout Errors

**Solutions:**
\`\`\`bash
# Increase timeout in resource
resource "aws_instance" "example" {
  timeouts {
    create = "60m"
    update = "60m"
    delete = "60m"
  }
}
\`\`\`

---

## Import Issues

### Finding Resource IDs

\`\`\`bash
# AWS Examples
aws ec2 describe-instances --query 'Reservations[].Instances[].[InstanceId,Tags[?Key==\`Name\`].Value|[0]]' --output table
aws s3 ls
aws rds describe-db-instances --query 'DBInstances[].[DBInstanceIdentifier]' --output text

# Azure Examples
az vm list --query '[].{Name:name, ID:id}' -o table

# GCP Examples
gcloud compute instances list --format="table(name,id,zone)"
\`\`\`

---

## Performance Issues

### Slow Plan/Apply

**Solutions:**
\`\`\`bash
# Reduce parallelism
terraform apply -parallelism=5

# Target specific resources
terraform apply -target=module.vpc

# Disable refresh
terraform plan -refresh=false

# Use smaller state files (split into workspaces)
terraform workspace new prod
terraform workspace new dev
\`\`\`

---

## Best Practices

\`\`\`bash
# Always run plan before apply
terraform plan -out=plan.out
terraform apply plan.out

# Backup state before major changes
terraform state pull > backup-$(date +%Y%m%d-%H%M%S).tfstate

# Use version constraints
terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}
\`\`\`

---

## Debugging

\`\`\`bash
# Enable debug logging
export TF_LOG=DEBUG
export TF_LOG_PATH=./terraform.log

# Validate configuration
terraform validate

# Format code
terraform fmt -recursive

# Interactive console
terraform console
\`\`\`
`

export default function Home() {
  const [activeTab, setActiveTab] = useState<'helm' | 'kubernetes' | 'terraform'>('helm')
  const [searchTerm, setSearchTerm] = useState('')

  const docs = {
    helm: helmChartDocs,
    kubernetes: kubernetesDocs,
    terraform: terraformDocs,
  }

  const filteredContent = searchTerm
    ? docs[activeTab]
        .split('\n')
        .filter(line => line.toLowerCase().includes(searchTerm.toLowerCase()))
        .join('\n')
    : docs[activeTab]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                PEII Documentation
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Helm Charts & DevOps Troubleshooting Guides
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
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search documentation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
          />
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('helm')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'helm'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                🚢 Helm Chart
              </button>
              <button
                onClick={() => setActiveTab('kubernetes')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'kubernetes'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                ☸️ Kubernetes
              </button>
              <button
                onClick={() => setActiveTab('terraform')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'terraform'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                🏗️ Terraform
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="p-8 overflow-y-auto max-h-[calc(100vh-300px)]">
            <div className="markdown prose prose-slate dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {filteredContent}
              </ReactMarkdown>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>Made with ❤️ for DevOps Engineers</p>
        </footer>
      </div>
    </div>
  )
}

