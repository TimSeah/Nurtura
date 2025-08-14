# AWS ECS Task Definitions for Nurtura Application

This directory contains the ECS task definition templates for deploying the Nurtura application to AWS ECS.

## Task Definitions

### 1. Frontend Task Definition (`frontend-task-definition.json`)
- Runs the nginx container serving the React frontend
- Configured to listen on port 80
- Uses the nurtura-frontend ECR repository

### 2. WebApp Task Definition (`webapp-task-definition.json`) 
- Runs the Node.js/Express backend API
- Configured to listen on port 5000
- Uses the nurtura-webapp ECR repository
- Includes environment variables for MongoDB, JWT, email configuration

### 3. AI Moderation Task Definition (`ai-task-definition.json`)
- Runs the Python AI moderation service
- Configured to listen on port 8001
- Uses the nurtura-ai-moderation ECR repository
- Includes resource limits for CPU and memory

## Usage

These task definitions are automatically updated by the GitHub Actions deployment workflow. The workflow:

1. Downloads the current task definition from ECS
2. Updates the image URI with the latest build
3. Registers the new task definition
4. Updates the ECS service to use the new task definition

## Environment Variables

Make sure to configure these environment variables in your ECS task definitions:

### WebApp Service
- `NODE_ENV`: production
- `MONGO_URI`: Your MongoDB connection string
- `JWT_SECRET`: Your JWT secret key
- `GMAIL_USER`: Gmail account for notifications
- `GMAIL_APP_PASSWORD`: Gmail app password
- `ENABLE_MODERATION`: true
- `MODERATION_SERVICE_URL`: http://ai-moderation:8001

### AI Moderation Service
- `API_HOST`: 0.0.0.0
- `API_PORT`: 8001
- `LOG_LEVEL`: INFO
- `MODEL_CACHE_DIR`: /app/models

## Resource Requirements

### Frontend
- CPU: 256 (0.25 vCPU)
- Memory: 512 MB

### WebApp
- CPU: 512 (0.5 vCPU)
- Memory: 1024 MB (1 GB)

### AI Moderation
- CPU: 1024 (1 vCPU)
- Memory: 2048 MB (2 GB)

## Health Checks

All services include health check configurations:
- Health check grace period: 60 seconds
- Health check interval: 30 seconds
- Health check timeout: 5 seconds
- Healthy threshold: 2
- Unhealthy threshold: 3

## Logging

All services are configured to send logs to AWS CloudWatch:
- Log group: `/ecs/nurtura-{service-name}`
- Log region: ap-southeast-1
- Log stream prefix: ecs

## Security

- All containers run as non-root users
- Task execution role: `ecsTaskExecutionRole-nurtura`
- Network mode: awsvpc (provides ENI for each task)
- Security groups configured for minimum required access
