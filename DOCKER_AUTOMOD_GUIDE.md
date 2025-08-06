# Docker Setup for Nurtura with Auto-Moderation

This document explains how to run Nurtura with the integrated auto-moderation service using Docker.

## Architecture Overview

The Dockerized Nurtura application uses a **microservices architecture** consisting of:
- **Frontend**: React/Vite application served by nginx (port 80)
- **Web App**: Node.js/Express server (port 5000)
- **AI Moderation**: Dedicated Python service with MetaHateBERT model (port 8001)

Each service runs in its own optimized container for better performance, scalability, and technology stack compatibility.

## Prerequisites

- Docker and Docker Compose installed
- At least 4GB of available RAM (for AI model)
- Internet connection for initial model download

## Production Deployment

### Quick Start
```bash
# Build and start all services
docker-compose up -d

# Or use the management script
.\docker.bat build
.\docker.bat up

# View logs
docker-compose logs -f
# or
.\docker.bat logs

# Stop services
docker-compose down
# or
.\docker.bat down
```

### Services
- **Frontend**: http://localhost (port 80)
- **Web App API**: http://localhost:5000
- **AI Moderation**: http://localhost:8001 (internal service + external testing)

### Management Commands
```bash
.\docker.bat build        # Build all containers
.\docker.bat up           # Start all services
.\docker.bat down         # Stop all services
.\docker.bat logs         # View all logs
.\docker.bat logs webapp  # View specific service logs
.\docker.bat test-ai      # Test AI moderation service
```

## Environment Variables

Create environment files:

### Web App Environment (server/.env)
```env
NODE_ENV=production
MONGODB_URI=mongodb://your-mongo-connection
JWT_SECRET=your-jwt-secret
ENABLE_MODERATION=true
USE_PERSISTENT_MODERATION=true
MODERATION_SERVICE_URL=http://ai-moderation:8001
```

### AI Moderation Environment (automod/.env)
```env
API_HOST=0.0.0.0
API_PORT=8001
LOG_LEVEL=INFO
MODEL_CACHE_DIR=/app/models
MODERATION_IDLE_TIMEOUT=30
```

## Container Specifications

### Web App Container (server/Dockerfile.webapp)
- **Base Image**: node:20-alpine
- **Exposed Ports**: 5000 (Node.js API)
- **Features**: Lightweight, production-optimized, health checks
- **User**: Non-root user for security

### AI Moderation Container (automod/Dockerfile)
- **Base Image**: python:3.12-slim
- **Exposed Ports**: 8001 (Python AI service)
- **Features**: PyTorch CPU, MetaHateBERT model, health monitoring
- **User**: Non-root user for security

### Frontend Container (Dockerfile.frontend)
- **Base Image**: nginx:alpine
- **Exposed Ports**: 80 (Static files + API proxy)
- **Features**: Optimized static serving, gzip compression, API proxying

## Health Monitoring

Each service provides health check endpoints:
- **Web App**: http://localhost:5000/health
- **AI Service**: http://localhost:8001/health
- **Frontend**: Serves the React application

## Microservices Benefits

1. **Technology Stack Optimization**: Each service uses its optimal base image
2. **Independent Scaling**: Scale AI service separately from web app
3. **Better Resource Management**: Dedicated resources for AI model
4. **Improved Security**: Service isolation and non-root users
5. **Faster Development**: Parallel development and deployment
- **Scripts**: Docker-compatible shell scripts (not Windows .bat files)

### Frontend Container
- **Base Image**: nginx:alpine
- **Exposed Port**: 80
- **Build Process**: Multi-stage build for optimization
- **Static Files**: Optimized production build

## Troubleshooting

### Common Issues

1. **Auto-Moderation Service Not Starting**
   ```bash
   # Check Python dependencies
   docker-compose exec backend python3 -c "import transformers, torch"
   
   # Check logs
   docker-compose logs backend | grep -i "auto"
   ```

2. **Model Download Issues**
   ```bash
   # Monitor first-time model download
   docker-compose logs -f backend
   
   # The model (1.5GB) downloads on first startup
   ```

3. **Port Conflicts**
   ```bash
   # Check if ports are already in use
   netstat -tulpn | grep -E ":(80|5000|8001|3000)"
   
   # Modify docker-compose.yml port mappings if needed
   ```

4. **Memory Issues**
   ```bash
   # Check container memory usage
   docker stats
   
   # Increase Docker memory allocation if needed
   ```

### Logs and Debugging

```bash
# View all logs
docker-compose logs

# Follow logs in real-time
docker-compose logs -f

# View specific service logs
docker-compose logs backend
docker-compose logs frontend

# Debug inside container
docker-compose exec backend sh
```

## Building and Testing

### Build Only
```bash
# Build without starting
docker-compose build

# Build specific service
docker-compose build backend
```

### Manual Service Management (if needed)
```bash
# Inside the container
docker-compose exec backend ./automod/manage-service.sh status
docker-compose exec backend ./automod/manage-service.sh restart

# Note: Windows .bat files are not used in Docker containers
# Use the .sh equivalents instead
```

## Performance Optimization

### Production Optimizations
- Multi-stage builds for minimal image size
- Non-root user for security
- Health checks for reliability
- Proper cache invalidation
- Alpine Linux for smaller images

### Development Optimizations
- Volume mounting for hot reload
- Separate development images
- Enhanced logging
- Debug mode enabled

## Updating and Maintenance

### Update Application
```bash
# Pull latest changes
git pull

# Rebuild and restart
docker-compose down
docker-compose build
docker-compose up -d
```

### Update Dependencies
```bash
# Rebuild backend with new dependencies
docker-compose build --no-cache backend
```

### Cleanup
```bash
# Remove old images and containers
docker system prune

# Remove volumes (BE CAREFUL - this removes data)
docker-compose down -v
```

## Security Considerations

- Containers run as non-root users
- Environment variables for sensitive data
- Network isolation between services
- Health checks for service monitoring
- Regular security updates recommended

## Support

For issues specific to:
- **Docker setup**: Check this documentation
- **Auto-moderation**: See `automod/README.md`
- **Application**: See main `README.md`
