# Kubernetes Troubleshooting Runbook
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
```bash

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

```

**Common Causes:**
- Image pull errors
- Missing secrets/configmaps
- Resource limits too low
- Application errors
- Failed health checks

  
**Solutions:**
```bash

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

```

  
### ImagePullBackOff

**Diagnosis:**
```bash

kubectl describe pod <pod-name> -n <namespace>

kubectl get events -n <namespace> --sort-by='.lastTimestamp'

```

**Solutions:**
```bash

# Check image pull secrets

kubectl get secrets -n <namespace>

kubectl describe secret <secret-name> -n <namespace>

# Create image pull secret if missing

kubectl create secret docker-registry regcred \

--docker-server=<registry-url> \

--docker-username=<username> \

--docker-password=<password> \

--docker-email=<email> \

-n <namespace>


# Verify image exists and tag is correct

docker pull <image>:<tag>


# Check if imagePullSecrets is referenced in deployment

kubectl get deployment <deployment-name> -n <namespace> -o yaml | grep imagePullSecrets

```
### Pod Pending State

**Diagnosis:**
```bash

kubectl describe pod <pod-name> -n <namespace>

kubectl get events -n <namespace> --field-selector involvedObject.name=<pod-name>

```

**Common Causes:**
- Insufficient resources
- Node selector mismatch
- Taints and tolerations
- PVC binding issues

**Solutions:**
```bash

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

```

  

### OOMKilled (Out of Memory)

**Diagnosis:**
```bash

# Check pod restart reason

kubectl describe pod <pod-name> -n <namespace> | grep -A 10 "Last State"

# Check resource usage
kubectl top pod <pod-name> -n <namespace>

# Get detailed memory stats
kubectl exec <pod-name> -n <namespace> -- cat /sys/fs/cgroup/memory/memory.usage_in_bytes

```

  

**Solutions:**

```bash

# Increase memory limits
kubectl edit deployment <deployment-name> -n <namespace>

# Update resources.limits.memory
# Or patch directly

kubectl patch deployment <deployment-name> -n <namespace> -p \

'{"spec":{"template":{"spec":{"containers":[{"name":"<container-name>","resources":{"limits":{"memory":"1Gi"}}}]}}}}'

```

---
## Service and Networking

### Service Not Reachable

**Diagnosis:**
```bash

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

```

  

**Solutions:**

```bash

# Verify selector matches pod labels
kubectl get svc <service-name> -n <namespace> -o jsonpath='{.spec.selector}'
kubectl get pods -n <namespace> -l <key>=<value>

# Check if pods are ready
kubectl get pods -n <namespace> -o wide

# Verify port configuration
kubectl get svc <service-name> -n <namespace> -o yaml

```

  

### DNS Issues

**Diagnosis:**
```bash

# Check CoreDNS pods
kubectl get pods -n kube-system -l k8s-app=kube-dns

# Check CoreDNS logs
kubectl logs -n kube-system -l k8s-app=kube-dns

# Test DNS resolution
kubectl run tmp-shell --rm -i --tty --image nicolaka/netshoot -- /bin/bash

nslookup kubernetes.default
nslookup <service-name>.<namespace>.svc.cluster.local

```

  

**Solutions:**

```bash

# Restart CoreDNS
kubectl rollout restart deployment coredns -n kube-system

# Check CoreDNS configmap
kubectl get configmap coredns -n kube-system -o yaml

# Verify cluster DNS is set correctly
kubectl run tmp-shell --rm -i --tty --image nicolaka/netshoot -- cat /etc/resolv.conf

```

  

### Ingress Not Working

**Diagnosis:**
```bash

# Check ingress
kubectl get ingress -n <namespace>
kubectl describe ingress <ingress-name> -n <namespace>

# Check ingress controller
kubectl get pods -n ingress-nginx
kubectl logs -n ingress-nginx <ingress-controller-pod>

# Verify backend service
kubectl get svc -n <namespace>
kubectl get endpoints -n <namespace>

```

**Solutions:**
```bash

# Check ingress class
kubectl get ingressclass

# Verify TLS secret exists
kubectl get secret <tls-secret-name> -n <namespace>

# Test backend directly
kubectl port-forward svc/<service-name> 8080:80 -n <namespace>

# Check ingress annotations
kubectl get ingress <ingress-name> -n <namespace> -o yaml | grep annotations -A 10

```
### Network Policies Blocking Traffic

**Diagnosis:**
```bash

# List network policies
kubectl get networkpolicies -n <namespace>
kubectl describe networkpolicy <policy-name> -n <namespace>

# Check pod labels
kubectl get pods -n <namespace> --show-labels

```

**Solutions:**
```bash

# Temporarily delete policy to test
kubectl delete networkpolicy <policy-name> -n <namespace>

# Check if policy allows traffic
kubectl get networkpolicy <policy-name> -n <namespace> -o yaml

```

---
## Storage Issues

### PVC Pending

**Diagnosis:**
```bash

# Check PVC status

kubectl get pvc -n <namespace>
kubectl describe pvc <pvc-name> -n <namespace>

# Check storage classes
kubectl get storageclass
kubectl describe storageclass <storage-class-name>

# Check PV
kubectl get pv

```

**Solutions:**
```bash

# Verify storage class exists
kubectl get storageclass

# Check if dynamic provisioning is enabled
kubectl describe storageclass <storage-class-name> | grep Provisioner

# Manually create PV if needed
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: PersistentVolume
metadata:
name: <pv-name>
spec:
capacity:
storage: 10Gi
accessModes:

- ReadWriteOnce
persistentVolumeReclaimPolicy: Retain
storageClassName: <storage-class>
hostPath:
path: /data
EOF

```
### Volume Mount Issues

**Diagnosis:**
```bash

# Check pod events
kubectl describe pod <pod-name> -n <namespace>

# Check if volume is mounted
kubectl exec <pod-name> -n <namespace> -- df -h
kubectl exec <pod-name> -n <namespace> -- ls -la /mount/path

```

**Solutions:**
```bash

# Verify volume definition in deployment
kubectl get deployment <deployment-name> -n <namespace> -o yaml | grep -A 20 volumes

# Check permissions
kubectl exec <pod-name> -n <namespace> -- ls -la /mount/path

```

---
## Node Issues

### Node NotReady

**Diagnosis:**
```bash

# Check node status
kubectl get nodes
kubectl describe node <node-name>

# Check node conditions
kubectl get nodes -o json | jq '.items[] | {name:.metadata.name, conditions:.status.conditions}'

# SSH to node and check kubelet
ssh <node>
sudo systemctl status kubelet
sudo journalctl -u kubelet -f

```

**Solutions:**
```bash

# Restart kubelet
ssh <node>
sudo systemctl restart kubelet

# Check disk pressure
df -h
docker system prune -a

# Check memory pressure
free -h
top

```

### Node Disk Pressure

**Diagnosis:**
```bash

kubectl describe node <node-name> | grep DiskPressure
kubectl top node <node-name>

# SSH to node
ssh <node>
df -h
du -sh /var/lib/docker/* | sort -h

```
  
**Solutions:**
```bash

# Clean up unused docker images/containers
ssh <node>
docker system prune -a --volumes -f

# Remove old logs
sudo journalctl --vacuum-time=3d
sudo find /var/log -type f -name "*.log" -delete

# Drain and cordon node if needed
kubectl drain <node-name> --ignore-daemonsets --delete-emptydir-data
kubectl cordon <node-name>

```

---
## Resource Limits

### Checking Resource Usage  
```bash

# Cluster-wide resource usage
kubectl top nodes
kubectl top pods --all-namespaces

# Specific namespace
kubectl top pods -n <namespace>

# Sort by CPU
kubectl top pods --all-namespaces --sort-by=cpu

# Sort by memory
kubectl top pods --all-namespaces --sort-by=memory

# Get resource requests and limits
kubectl describe nodes | grep -A 5 "Allocated resources"

# Resource quotas
kubectl get resourcequota -n <namespace>
kubectl describe resourcequota -n <namespace>

# Limit ranges
kubectl get limitrange -n <namespace>
kubectl describe limitrange -n <namespace>

```

### CPU Throttling

**Diagnosis:**
```bash

# Check CPU metrics
kubectl top pod <pod-name> -n <namespace>

# Check container CPU usage
kubectl exec <pod-name> -n <namespace> -- cat /sys/fs/cgroup/cpu/cpu.stat

```
  
**Solutions:**
```bash

# Increase CPU limits
kubectl patch deployment <deployment-name> -n <namespace> -p \
'{"spec":{"template":{"spec":{"containers":[{"name":"<container-name>","resources":{"limits":{"cpu":"1000m"}}}]}}}}'

```

---
## RBAC and Security

### Permission Denied

**Diagnosis:**
```bash

# Check current context
kubectl config current-context

# Check service account
kubectl get sa -n <namespace>
kubectl describe sa <sa-name> -n <namespace>

# Check roles and rolebindings
kubectl get roles,rolebindings -n <namespace>
kubectl get clusterroles,clusterrolebindings

# Check what a service account can do
kubectl auth can-i --list --as=system:serviceaccount:<namespace>:<sa-name>

# Check specific permission
kubectl auth can-i get pods -n <namespace> --as=system:serviceaccount:<namespace>:<sa-name>

```

**Solutions:**
```bash

# Create role
kubectl create role <role-name> \
--verb=get,list,watch \
--resource=pods \
-n <namespace>

# Create rolebinding
kubectl create rolebinding <binding-name> \
--role=<role-name> \
--serviceaccount=<namespace>:<sa-name> \
-n <namespace>

# Create clusterrole and clusterrolebinding for cluster-wide access
kubectl create clusterrole <role-name> --verb=get,list,watch --resource=nodes
kubectl create clusterrolebinding <binding-name> --clusterrole=<role-name> --serviceaccount=<namespace>:<sa-name>

```

---
## Performance Issues

### Slow API Server

**Diagnosis:**
```bash

# Check API server response time
time kubectl get pods --all-namespaces

# Check API server logs
kubectl logs -n kube-system kube-apiserver-<node-name>

# Check etcd performance
kubectl exec -n kube-system etcd-<node-name> -- etcdctl endpoint status --cluster -w table

```
### High Pod Evictions

**Diagnosis:**
```bash

# Check pod evictions
kubectl get pods --all-namespaces -o json | jq '.items[] | select(.status.reason=="Evicted")'

# Count evictions
kubectl get pods --all-namespaces -o json | jq '[.items[] | select(.status.reason=="Evicted")] | length'

# Delete evicted pods
kubectl get pods --all-namespaces -o json | jq -r '.items[] | select(.status.reason=="Evicted") | "\(.metadata.namespace) \(.metadata.name)"' | xargs -n 2 kubectl delete pod -n

```

---
## Cluster Health
### Overall Health Check
```bash

# Check all components
kubectl get componentstatuses
kubectl get nodes
kubectl get pods --all-namespaces

# Check system pods
kubectl get pods -n kube-system

# Check events (last hour)
kubectl get events --all-namespaces --sort-by='.lastTimestamp' | grep -v "Normal"

# Check certificate expiration
kubeadm certs check-expiration

# Check cluster info
kubectl cluster-info
kubectl version

```
### Useful Debug Commands
```bash

# Run debug container in same network namespace as another pod
kubectl debug <pod-name> -n <namespace> -it --image=nicolaka/netshoot

# Copy a pod for debugging (creates new pod with same spec)
kubectl debug <pod-name> -n <namespace> -it --copy-to=<new-pod-name> --container=<container-name>

# Create ephemeral debug container in running pod (k8s 1.23+)
kubectl debug -it <pod-name> -n <namespace> --image=busybox:1.28 --target=<container-name>

# Port forward
kubectl port-forward <pod-name> 8080:80 -n <namespace>

# Execute command in pod
kubectl exec -it <pod-name> -n <namespace> -- /bin/bash

# Copy files from pod
kubectl cp <namespace>/<pod-name>:/path/to/file /local/path

# Copy files to pod
kubectl cp /local/path <namespace>/<pod-name>:/path/to/file

```

### Quick Reference Sheet
```bash

# Get all resources in namespace
kubectl get all -n <namespace>

# Get all resources cluster-wide
kubectl get all --all-namespaces

# Get resource with custom columns
kubectl get pods -o custom-columns=NAME:.metadata.name,STATUS:.status.phase,NODE:.spec.nodeName

# Get resource as JSON
kubectl get pod <pod-name> -n <namespace> -o json

# Get resource as YAML
kubectl get pod <pod-name> -n <namespace> -o yaml

# Watch resources
kubectl get pods -n <namespace> -w

# Diff before applying
kubectl diff -f manifest.yaml

# Dry run
kubectl apply -f manifest.yaml --dry-run=client
kubectl apply -f manifest.yaml --dry-run=server

# Force delete pod
kubectl delete pod <pod-name> -n <namespace> --grace-period=0 --force

# Scale deployment
kubectl scale deployment <deployment-name> -n <namespace> --replicas=3

# Rollout status
kubectl rollout status deployment/<deployment-name> -n <namespace>

# Rollout history
kubectl rollout history deployment/<deployment-name> -n <namespace>

# Rollback
kubectl rollout undo deployment/<deployment-name> -n <namespace>

# Edit resource
kubectl edit deployment <deployment-name> -n <namespace>

# Patch resource
kubectl patch deployment <deployment-name> -n <namespace> -p '{"spec":{"replicas":3}}'

# Label resources
kubectl label pods <pod-name> <key>=<value> -n <namespace>

# Annotate resources
kubectl annotate pods <pod-name> <key>=<value> -n <namespace>

```

---
## Additional Tools

### kubectx and kubens
```bash

# Switch context
kubectx <context-name>

# Switch namespace
kubens <namespace>

```

### k9s
```bash

# Interactive cluster management
k9s

```
### stern
```bash

# Multi-pod log tailing
stern <pod-query> -n <namespace>
stern "^pod-prefix" -n <namespace> --tail 100

```
### krew
```bash

# Plugin manager for kubectl
kubectl krew install <plugin-name>

# Useful plugins
kubectl krew install tree
kubectl krew install access-matrix
kubectl krew install whoami
kubectl krew install view-allocations

```