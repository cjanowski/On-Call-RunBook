# Terraform Troubleshooting Runbook

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
- [Remote Backend Issues](#remote-backend-issues)
- [Common Patterns](#common-patterns)

---
## State File Issues  
### State File Locked

**Error:**
```

Error: Error acquiring the state lock

```

**Diagnosis:**
```bash

# Check state lock info
terraform force-unlock <lock-id>

# For S3 backend, check DynamoDB
aws dynamodb get-item \
--table-name terraform-state-lock \
--key '{"LockID":{"S":"<state-file-path>"}}'

```

**Solutions:**
```bash

# Force unlock (use with caution)
terraform force-unlock <lock-id>

# For S3/DynamoDB backend
aws dynamodb delete-item \
--table-name terraform-state-lock \
--key '{"LockID":{"S":"<state-file-path>"}}'

# Prevention: Always use `terraform apply` with timeout
timeout 30m terraform apply

```
### State File Corrupted

**Diagnosis:**
```bash

# Validate state
terraform show

# List resources in state
terraform state list

# Check state file integrity
cat terraform.tfstate | jq .

```

**Solutions:**
```bash

# Pull current state
terraform state pull > backup.tfstate

# Restore from backup
terraform state push backup.tfstate

# For remote backend (S3)
aws s3 cp s3://bucket/path/terraform.tfstate backup.tfstate
aws s3 cp backup.tfstate s3://bucket/path/terraform.tfstate

# Enable versioning on S3 bucket to prevent data loss
aws s3api put-bucket-versioning \
--bucket <bucket-name> \
--versioning-configuration Status=Enabled

```
### Resource in State but Not in Config

**Diagnosis:**
```bash

# List all resources
terraform state list

# Show specific resource
terraform state show <resource-address>

# Check for resources not in config
terraform plan

```

**Solutions:**
```bash

# Remove resource from state (doesn't destroy resource)
terraform state rm <resource-address>

# Move resource to different address
terraform state mv <source> <destination>

# Import existing resource
terraform import <resource-address> <resource-id>

# Replace provider
terraform state replace-provider <old-provider> <new-provider>

```  
### State Drift

**Diagnosis:**
```bash

# Check for drift
terraform plan -refresh-only

# Show current state
terraform show

# Compare with actual infrastructure
terraform refresh
terraform plan

```

**Solutions:**
```bash

# Update state to match reality
terraform apply -refresh-only

# Ignore drift for specific resources (add to .tf file)
lifecycle {
ignore_changes = [
tags,
last_modified_date
]
}

# Prevent automatic changes
lifecycle {
prevent_destroy = true
}

```

---
## Provider Issues

### Provider Version Conflicts

**Error:**
```

Error: Incompatible provider version

```

**Diagnosis:**
```bash

# Check provider versions
terraform version
terraform providers

# Check required providers
cat .terraform.lock.hcl

```

**Solutions:**
```bash

# Lock provider versions in terraform block
terraform {
required_providers {
aws = {
source = "hashicorp/aws"
version = "~> 5.0"
}
}
}

# Update providers
terraform init -upgrade

# Reconfigure providers
terraform init -reconfigure

# Migrate state to new provider
terraform init -migrate-state

```

### Provider Authentication Issues

**Error:**
```

Error: error configuring Terraform AWS Provider

```

**Diagnosis:**
```bash

# Check AWS credentials
aws sts get-caller-identity

# Check environment variables
env | grep AWS

# Check credentials file
cat ~/.aws/credentials

```

**Solutions:**
```bash

# Set AWS credentials
export AWS_ACCESS_KEY_ID="<access-key>"
export AWS_SECRET_ACCESS_KEY="<secret-key>"
export AWS_DEFAULT_REGION="us-east-1"

# Use AWS profile
export AWS_PROFILE=<profile-name>

# Assume role
aws sts assume-role --role-arn <role-arn> --role-session-name <session-name>

# For other providers (example: GCP)
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/key.json"

# For Azure
az login
export ARM_SUBSCRIPTION_ID="<subscription-id>"
export ARM_TENANT_ID="<tenant-id>"

```

  

### Provider Plugin Issues

**Error:**
```

Error: Failed to install provider

```

**Solutions:**
```bash

# Clear terraform cache
rm -rf .terraform
rm .terraform.lock.hcl
  
# Reinitialize
terraform init

# Use specific plugin directory
terraform init -plugin-dir=/path/to/plugins

# Disable provider plugin caching
export TF_PLUGIN_CACHE_DIR=""

# Download providers manually
terraform providers mirror /path/to/mirror

```

---
## Resource Drift

### Detecting Drift
```bash

# Full refresh and check
terraform plan -refresh-only

# Detailed diff
terraform plan -out=plan.out
terraform show -json plan.out | jq

# Check specific resource
terraform plan -target=<resource-address>

# Generate drift report
terraform plan -refresh-only -json | jq -r '.resource_changes[] | select(.change.actions[] == "update") | .address'

```
### Handling Drift
```bash

# Accept drift (update state)
terraform apply -refresh-only

# Force replacement of drifted resource
terraform apply -replace=<resource-address>  

# Taint resource (force recreation on next apply)
terraform apply -replace=<resource-address>

# Ignore specific attributes

# In .tf file:
resource "aws_instance" "example" {
# ...
lifecycle {
ignore_changes = [
tags,
user_data
]
}
}

```

---

## Plan and Apply Errors

### Dependency Issues

**Error:**
```

Error: Cycle in resource dependencies

```

**Diagnosis:**
```bash

# Generate dependency graph
terraform graph | dot -Tpng > graph.png

# Or use online tool
terraform graph | pbcopy

# Paste into http://www.webgraphviz.com/

```

**Solutions:**
```bash

# Explicit dependencies
resource "aws_instance" "example" {

# ...
depends_on = [aws_security_group.example]
}

# Break circular dependencies by using data sources
data "aws_resource" "existing" {

# ...
}  

# Use terraform_data to break cycles
resource "terraform_data" "example" {
input = aws_instance.example.id
}

```

### Resource Already Exists 

**Error:**
```

Error: Resource already exists

``` 

**Solutions:**
```bash

# Import existing resource
terraform import <resource-address> <resource-id>

# Examples:
terraform import aws_instance.example i-1234567890abcdef0
terraform import aws_s3_bucket.example my-bucket-name
terraform import aws_vpc.example vpc-12345678

# Import with variables
terraform import -var-file=prod.tfvars aws_instance.example i-1234567890abcdef0

# After import, verify
terraform plan

```

### Timeout Errors

**Error:**
```

Error: timeout while waiting for state to become 'success'

```

**Solutions:**
```bash

# Increase timeout in resource
resource "aws_instance" "example" {

# ...
timeouts {
create = "60m"
update = "60m"
delete = "60m"
}
}

# Set provider-level timeouts
provider "aws" {

# ...
max_retries = 5
}

# Retry apply
terraform apply -parallelism=1

```
### Insufficient Permissions

**Error:**
```

Error: UnauthorizedOperation

```

**Diagnosis:**
```bash

# Check current identity
aws sts get-caller-identity

# Check IAM permissions
aws iam get-user-policy --user-name <user> --policy-name <policy>
aws iam list-attached-user-policies --user-name <user>

# Simulate policy
aws iam simulate-principal-policy \
--policy-source-arn <arn> \
--action-names ec2:RunInstances

```

**Solutions:**
```bash

# Attach necessary policy to user/role
aws iam attach-user-policy \
--user-name <user> \
--policy-arn arn:aws:iam::aws:policy/PowerUserAccess
 
# Use different credentials with sufficient permissions
export AWS_PROFILE=admin-profile

```

---
## Import Issues

### Finding Resource IDs
```bash

# AWS Examples
aws ec2 describe-instances --query 'Reservations[].Instances[].[InstanceId,Tags[?Key==`Name`].Value|[0]]' --output table
aws s3 ls
aws rds describe-db-instances --query 'DBInstances[].[DBInstanceIdentifier]' --output text
aws elbv2 describe-load-balancers --query 'LoadBalancers[].[LoadBalancerArn,LoadBalancerName]' --output table
aws ec2 describe-vpcs --query 'Vpcs[].[VpcId,Tags[?Key==`Name`].Value|[0]]' --output table

# Azure Examples
az vm list --query '[].{Name:name, ID:id}' -o table
az storage account list --query '[].{Name:name, ID:id}' -o table

# GCP Examples
gcloud compute instances list --format="table(name,id,zone)"
gcloud sql instances list --format="table(name,connectionName)"

```
### Bulk Import Script
```bash

# Create import script
cat > import.sh <<'EOF'
#!/bin/bash
set -e

# Import multiple resources
declare -A resources=(
["aws_instance.web1"]="i-1234567890abcdef0"
["aws_instance.web2"]="i-0fedcba0987654321"
["aws_s3_bucket.data"]="my-data-bucket"
["aws_security_group.web"]="sg-12345678"
)
for resource in "${!resources[@]}"; do
echo "Importing $resource with ID ${resources[$resource]}"
terraform import "$resource" "${resources[$resource]}" || echo "Failed to import $resource"
done
EOF

chmod +x import.sh
./import.sh

```
### Import Block (Terraform 1.5+)
```hcl

# Using import blocks
import {
to = aws_instance.example
id = "i-1234567890abcdef0"
}

# Generate configuration
terraform plan -generate-config-out=generated.tf

```

---
## Module Issues

### Module Not Found

**Error:**
```

Error: Module not found
```

**Solutions:**
```bash

# Initialize modules
terraform init

# Update modules
terraform get -update

# Clear module cache
rm -rf .terraform/modules
terraform init

# For git modules, check SSH keys
ssh-add ~/.ssh/id_rsa
terraform init

```

### Module Version Conflicts

**Diagnosis:**
```bash

# Check module versions
terraform providers

# Show module tree
terraform providers schema -json | jq

```

**Solutions:**
```hcl

# Pin module versions
module "vpc" {
source = "terraform-aws-modules/vpc/aws"
version = "~> 5.0"
}

# For git sources
module "example" {
source = "git::https://github.com/org/repo.git?ref=v1.0.0"
}

# For local development
module "example" {
source = "../local-module"
}

```
### Module Output Not Available

**Error:**
```

Error: Unsupported attribute

```

**Solutions:**
```bash

# Check module outputs
terraform output -module=<module-name>

# Show all outputs
terraform output -json

# In module, ensure output is defined

# modules/example/outputs.tf
output "vpc_id" {
value = aws_vpc.main.id
description = "The VPC ID"
}

# Reference in root module
resource "aws_subnet" "example" {
vpc_id = module.vpc.vpc_id
}

```

---
## Performance Issues

### Slow Plan/Apply


**Diagnosis:**

```bash

# Enable debug logging
export TF_LOG=DEBUG
export TF_LOG_PATH=./terraform.log
terraform plan

# Profile performance
time terraform plan

# Check number of resources
terraform state list | wc -l

```

**Solutions:**
```bash

# Reduce parallelism
terraform apply -parallelism=5

# Target specific resources
terraform apply -target=module.vpc
terraform apply -target=aws_instance.web

# Disable refresh
terraform plan -refresh=false

# Use smaller state files (split into workspaces)
terraform workspace new prod
terraform workspace new dev
 
# Use remote state data sources
data "terraform_remote_state" "vpc" {
backend = "s3"
config = {
bucket = "terraform-state"
key = "vpc/terraform.tfstate"
region = "us-east-1"
}
}

```
### Large State File

**Solutions:**
```bash

# Split infrastructure into multiple state files

# Project structure:

# - network/

# - compute/

# - database/

  

# Each with its own backend

terraform {
backend "s3" {
bucket = "terraform-state"
key = "network/terraform.tfstate"
region = "us-east-1"
}
}

# Use remote state to share outputs
data "terraform_remote_state" "network" {
backend = "s3"
config = {
bucket = "terraform-state"
key = "network/terraform.tfstate"
region = "us-east-1"
}
}

```

---
## Workspace Issues

### Workspace Commands
```bash

# List workspaces
terraform workspace list

# Create workspace
terraform workspace new dev

# Switch workspace
terraform workspace select dev

# Delete workspace
terraform workspace delete dev

# Show current workspace
terraform workspace show

```  
### Workspace State Location
```bash

# Local backend

# terraform.tfstate.d/dev/terraform.tfstate

# S3 backend with workspaces
terraform {
backend "s3" {
bucket = "terraform-state"
key = "env/terraform.tfstate"
region = "us-east-1"
workspace_key_prefix = "workspaces"
}
}

# Results in: s3://terraform-state/workspaces/dev/env/terraform.tfstate

```
### Using Workspace in Configuration
```hcl

# Reference current workspace
resource "aws_instance" "example" {

# ...

tags = {
Environment = terraform.workspace
}
}

# Workspace-specific values
locals {
instance_types = {
dev = "t3.micro"
staging = "t3.small"
prod = "t3.large"
}
instance_type = local.instance_types[terraform.workspace]
}

```

---
## Remote Backend Issues

### S3 Backend Configuration
```hcl

terraform {
backend "s3" {
bucket = "terraform-state-bucket"
key = "prod/terraform.tfstate"
region = "us-east-1"
encrypt = true
dynamodb_table = "terraform-state-lock"
kms_key_id = "arn:aws:kms:us-east-1:123456789012:key/12345678-1234-1234-1234-123456789012"
}
}

```

### Backend Initialization Issues

**Solutions:**
```bash

# Migrate from local to remote
terraform init -migrate-state

# Reconfigure backend
terraform init -reconfigure

# Force copy state (overwrites remote)
terraform init -force-copy

# Backend partial configuration
terraform init \
-backend-config="bucket=terraform-state" \
-backend-config="key=prod/terraform.tfstate" \
-backend-config="region=us-east-1"

```
### State Locking Issues (DynamoDB)

**Setup:**
```bash

# Create DynamoDB table for locking
aws dynamodb create-table \
--table-name terraform-state-lock \
--attribute-definitions AttributeName=LockID,AttributeType=S \
--key-schema AttributeName=LockID,KeyType=HASH \
--billing-mode PAY_PER_REQUEST

```

**Check Lock:**
```bash

# Query lock table
aws dynamodb scan --table-name terraform-state-lock

# Delete stuck lock
aws dynamodb delete-item \
--table-name terraform-state-lock \
--key '{"LockID":{"S":"bucket-name/path/terraform.tfstate-md5"}}'

```

---
## Common Patterns

### Debugging Terraform
```bash

# Enable debug logging
export TF_LOG=DEBUG
export TF_LOG_PATH=./terraform-debug.log

# Log levels: TRACE, DEBUG, INFO, WARN, ERROR
export TF_LOG=TRACE

# Core and provider logs separately
export TF_LOG_CORE=DEBUG
export TF_LOG_PROVIDER=TRACE

# Disable logging
unset TF_LOG
unset TF_LOG_PATH

```
### Validating Configuration
```bash

# Format code
terraform fmt -recursive

# Validate configuration
terraform validate

# Check with external validators
tflint
tfsec .
checkov -d .

# Test with different variables
terraform plan -var-file=dev.tfvars
terraform plan -var-file=prod.tfvars

```
### Best Practices Commands

```bash

# Always initialize first
terraform init

# Run plan before apply
terraform plan -out=plan.out
terraform show plan.out
terraform apply plan.out

# Use workspaces for environments
terraform workspace new dev
terraform workspace select dev

# Version everything
git tag -a v1.0.0 -m "Version 1.0.0"
git push origin v1.0.0

# Backup state before major changes
terraform state pull > backup-$(date +%Y%m%d-%H%M%S).tfstate

# Use consistent naming

# resource "aws_instance" "web_server" not "webServer"

# Always use version constraints
terraform {
required_version = ">= 1.5.0"
required_providers {
aws = {
source = "hashicorp/aws"
version = "~> 5.0"
}
}
}

```
### Emergency Procedures
```bash

# Stop ongoing apply (Ctrl+C)

# Then check state
terraform show

# Recover from interrupted apply
terraform plan
terraform apply 

# Completely start over (DANGEROUS)
terraform destroy
rm -rf .terraform terraform.tfstate*
terraform init
terraform apply

# Restore from backup
aws s3 cp s3://bucket/path/terraform.tfstate.backup terraform.tfstate
terraform state push terraform.tfstate

# Manual state manipulation (CAREFUL)
terraform state list
terraform state show <resource>
terraform state rm <resource>
terraform state mv <source> <dest>

```
### Common tfvars Patterns
```hcl

# dev.tfvars
environment = "dev"
instance_type = "t3.micro"
instance_count = 1
enable_monitoring = false

# prod.tfvars
environment = "prod"
instance_type = "t3.large"
instance_count = 3
enable_monitoring = true

```
### Using Terraform Console

```bash

# Interactive console
terraform console

# Examples in console:
> var.environment
> aws_instance.web.id
> module.vpc.vpc_id
> length(var.availability_zones)
> [for s in var.subnets : s.cidr_block]

# Use console in scripts
echo 'var.environment' | terraform console

```
### Generate Documentation
```bash

# Install terraform-docs
brew install terraform-docs

# Generate README
terraform-docs markdown table . > README.md

# Generate for all modules
find . -type d -name "modules" -exec terraform-docs markdown table {} \;

```

---
## Useful Tools

### Terraform Linters and Validators
```bash

# TFLint
brew install tflint
tflint --init
tflint

# tfsec (security scanner)
brew install tfsec
tfsec .

# Checkov
pip install checkov
checkov -d .

# Terrascan
brew install terrascan
terrascan scan  

# Terraform Compliance
pip install terraform-compliance
terraform-compliance -f features -p plan.out

```
### State Management Tools

```bash

# Terraformer (import existing infrastructure)
brew install terraformer
terraformer import aws --resources=vpc,subnet --regions=us-east-1

# Terraform Visual
terraform graph | dot -Tsvg > graph.svg

# Inframap
brew install cycloidio/cycloid/inframap
inframap generate terraform.tfstate | dot -Tpng > map.png

```
### CI/CD Integration
```yaml

# GitHub Actions Example
name: Terraform
on: [push]
jobs:
terraform:
runs-on: ubuntu-latest
steps:
- uses: actions/checkout@v3
- uses: hashicorp/setup-terraform@v2
- run: terraform init
- run: terraform validate
- run: terraform plan
- run: terraform apply -auto-approve
if: github.ref == 'refs/heads/main'

```

```yaml

# GitLab CI Example
stages:
- validate
- plan
- apply
validate:
stage: validate
script:
- terraform init
- terraform validate
- terraform fmt -check
plan:
stage: plan
script:
- terraform init
- terraform plan -out=plan.out
artifacts:
paths:
- plan.out
apply:
stage: apply
script:
- terraform apply plan.out
when: manual
only:
- main

```