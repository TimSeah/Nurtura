# AWS Deployment Setup Guide

This guide walks you through setting up CI/CD for your Nurtura application deployment to AWS.

## 🚀 Quick Start

### 1. GitHub Secrets Configuration

Add these secrets to your GitHub repository (Settings > Secrets and variables > Actions):

```bash
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
```

### 2. AWS Parameters Store Setup

Store sensitive configuration in AWS Systems Manager Parameter Store:

```bash
# MongoDB connection string
aws ssm put-parameter --name "/nurtura/mongo-uri" --value "mongodb+srv://user:pass@cluster.mongodb.net/nurtura" --type "SecureString"

# JWT secret
aws ssm put-parameter --name "/nurtura/jwt-secret" --value "your-super-secure-jwt-secret" --type "SecureString"

# Gmail configuration
aws ssm put-parameter --name "/nurtura/gmail-user" --value "your-email@gmail.com" --type "SecureString"
aws ssm put-parameter --name "/nurtura/gmail-app-password" --value "your-app-password" --type "SecureString"
```

### 3. Create Infrastructure

Run the infrastructure workflow to set up AWS resources:

```bash
# Go to Actions tab in GitHub
# Run "Create AWS Infrastructure" workflow
# Select environment: staging or production
```

## 📋 Workflow Overview

### 1. CI Workflow (`.github/workflows/ci.yml`)
Runs on every push and pull request:
- ✅ Lint and format checking
- ✅ Frontend tests (Jest + Vitest)  
- ✅ Backend tests with MongoDB
- ✅ AI service validation
- ✅ Docker build testing
- ✅ End-to-end Cypress tests
- ✅ Security scanning

### 2. Infrastructure Workflow (`.github/workflows/infrastructure.yml`)
Creates AWS infrastructure:
- 🏗️ ECR repositories for Docker images
- 🏗️ ECS cluster and services
- 🏗️ VPC, subnets, and security groups
- 🏗️ Application Load Balancer
- 🏗️ IAM roles and policies

### 3. Deployment Workflow (`.github/workflows/deploy-to-aws.yml`)
Deploys to AWS on main branch pushes:
- 🏗️ Builds and pushes Docker images to ECR
- 🏗️ Updates ECS task definitions
- 🏗️ Deploys to ECS services
- 🏗️ Waits for deployment stability

## 🔧 Configuration

### Environment Variables

Update the environment variables in the workflows to match your setup:

```yaml
env:
  AWS_REGION: ap-southeast-1  # Change to your preferred region
  ECR_REPOSITORY_FRONTEND: nurtura-frontend
  ECR_REPOSITORY_WEBAPP: nurtura-webapp
  ECR_REPOSITORY_AI: nurtura-ai-moderation
  ECS_CLUSTER: nurtura-cluster
```

### Task Definitions

The task definitions in `.github/workflows/task-definitions/` define:
- Resource requirements (CPU, memory)
- Environment variables
- Health check configurations
- Logging settings

## 🚢 Deployment Process

### Automatic Deployment
1. Push to `main` branch
2. CI tests run and must pass
3. Docker images are built and pushed to ECR
4. ECS task definitions are updated
5. Services are deployed to ECS
6. Health checks verify deployment

### Manual Deployment
Use the GitHub Actions interface to:
1. Trigger infrastructure creation
2. Run specific test suites
3. Deploy to staging/production environments

## 🔍 Monitoring and Debugging

### CloudWatch Logs
- Frontend logs: `/ecs/nurtura-frontend`
- Backend logs: `/ecs/nurtura-webapp`  
- AI service logs: `/ecs/nurtura-ai-moderation`

### Health Checks
- Frontend: `http://load-balancer/`
- Backend: `http://load-balancer/api/health`
- AI service: `http://ai-service:8001/health`

### ECS Service Monitoring
```bash
# Check service status
aws ecs describe-services --cluster nurtura-cluster --services nurtura-frontend-service

# Check task logs
aws logs get-log-events --log-group-name /ecs/nurtura-webapp --log-stream-name ecs/nurtura-webapp/task-id
```

## 🔒 Security Best Practices

### Secrets Management
- ✅ Store sensitive data in AWS Parameter Store
- ✅ Use IAM roles instead of long-term access keys where possible
- ✅ Enable secret scanning in GitHub
- ✅ Rotate secrets regularly

### Container Security
- ✅ Non-root user containers
- ✅ Minimal base images (Alpine Linux)
- ✅ Security scanning with Trivy
- ✅ Image vulnerability scanning in ECR

### Network Security
- ✅ VPC with private subnets for services
- ✅ Security groups with minimal required access
- ✅ Load balancer for public access only
- ✅ Service-to-service communication within VPC

## 🚨 Troubleshooting

### Common Issues

**Deployment fails with "Task failed to start"**
```bash
# Check ECS service events
aws ecs describe-services --cluster nurtura-cluster --services service-name

# Check task definition validity
aws ecs describe-task-definition --task-definition task-name
```

**Images not found in ECR**
```bash
# Verify image exists
aws ecr list-images --repository-name nurtura-frontend

# Check build logs in GitHub Actions
```

**Health checks failing**
```bash
# Check application logs
aws logs tail /ecs/nurtura-webapp --follow

# Test health endpoint directly
curl -f http://load-balancer-dns/api/health
```

**AI service out of memory**
```bash
# Increase memory allocation in task definition
# Monitor CloudWatch metrics for memory usage
# Consider using GPU instances for better performance
```

## 📈 Scaling and Optimization

### Auto Scaling
Configure ECS service auto scaling:
```bash
# CPU-based scaling
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --scalable-dimension ecs:service:DesiredCount \
  --resource-id service/nurtura-cluster/nurtura-webapp-service \
  --min-capacity 1 \
  --max-capacity 10
```

### Cost Optimization
- Use Fargate Spot for non-critical services
- Right-size container resources
- Implement CloudWatch cost monitoring
- Use multi-stage Docker builds for smaller images

### Performance
- Enable CloudFront for static assets
- Use RDS for production database
- Implement Redis for session storage
- Monitor application performance with X-Ray

## 🎯 Next Steps

1. **Domain Setup**: Configure your domain to point to the Load Balancer
2. **SSL Certificate**: Set up SSL certificate in AWS Certificate Manager  
3. **Monitoring**: Set up CloudWatch dashboards and alarms
4. **Backup**: Configure automated database backups
5. **CDN**: Set up CloudFront for global content delivery
