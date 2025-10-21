# 🚨 On Call Runbook

**Your Essential DevOps & Kubernetes Troubleshooting Guide**

📚 **Live Documentation:** https://on-call-run-book.vercel.app/

---

## Helm Chart Guide

A comprehensive Helm chart for deploying applications on Kubernetes.

## Prerequisites

- Kubernetes 1.19+
- Helm 3.2.0+

## Installing the Chart

To install the chart with the release name `my-release`:

```bash
helm install my-release .
```

## Uninstalling the Chart

To uninstall/delete the `my-release` deployment:

```bash
helm uninstall my-release
```

## Configuration

The following table lists the configurable parameters of the PEII chart and their default values.

| Parameter | Description | Default |
|-----------|-------------|---------|
| `replicaCount` | Number of replicas | `2` |
| `image.repository` | Image repository | `nginx` |
| `image.tag` | Image tag | `latest` |
| `image.pullPolicy` | Image pull policy | `IfNotPresent` |
| `service.type` | Kubernetes service type | `ClusterIP` |
| `service.port` | Service port | `80` |
| `service.targetPort` | Container port | `8080` |
| `ingress.enabled` | Enable ingress | `false` |
| `ingress.className` | Ingress class name | `nginx` |
| `resources.limits.cpu` | CPU limit | `500m` |
| `resources.limits.memory` | Memory limit | `512Mi` |
| `resources.requests.cpu` | CPU request | `250m` |
| `resources.requests.memory` | Memory request | `256Mi` |
| `autoscaling.enabled` | Enable HPA | `false` |
| `autoscaling.minReplicas` | Minimum replicas | `2` |
| `autoscaling.maxReplicas` | Maximum replicas | `10` |

## Examples

### Install with custom values

```bash
helm install my-release . \
  --set image.repository=myapp \
  --set image.tag=v1.0.0 \
  --set ingress.enabled=true \
  --set ingress.hosts[0].host=myapp.example.com
```

### Install with values file

Create a `custom-values.yaml`:

```yaml
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
```

Then install:

```bash
helm install my-release . -f custom-values.yaml
```

### Upgrade deployment

```bash
helm upgrade my-release . --set image.tag=v1.1.0
```

## CD Integration

### GitHub Actions

```yaml
- name: Deploy with Helm
  run: |
    helm upgrade --install my-release ./chart \
      --set image.tag=${{ github.sha }} \
      --wait
```

### GitLab CI

```yaml
deploy:
  stage: deploy
  script:
    - helm upgrade --install my-release ./chart
        --set image.tag=$CI_COMMIT_SHA
        --wait
```

### ArgoCD

Create an Application manifest:

```yaml
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
```
