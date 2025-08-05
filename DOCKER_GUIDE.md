# Docker Guide for Nurtura Web App

This guide shows you how to run, build, and manage the Nurtura web application using Docker. No prior Docker experience required!

## Prerequisites

1. **Install Docker Desktop**
   - Download from: https://www.docker.com/products/docker-desktop/
   - Install and start Docker Desktop
   - Verify installation by opening a terminal and running: `docker --version`

## Two Ways to Use Docker

### Option 1: Simple Batch Script (Recommended for Windows)
Use the provided `docker.bat` script for simplified commands:

```powershell
.\docker.bat up      # Start production app
.\docker.bat down    # Stop app
.\docker.bat dev     # Start development mode
.\docker.bat status  # Check status
```

### Option 2: Direct Docker Compose Commands
Use `docker-compose` commands directly:

```powershell
docker-compose up -d    # Start production app
docker-compose down     # Stop app
```

**Recommendation**: Use `.\docker.bat` - it's simpler and includes helpful messages!

## Quick Start (Most Common Commands)

### 🚀 Start the Application

**Production Mode (Recommended):**
```powershell
.\docker.bat up
```
- Optimized for performance
- Access at: http://localhost

**Development Mode:**
```powershell
.\docker.bat dev
```
- Live code reloading
- Access at: http://localhost:3000

### 🛑 Stop the Application
```powershell
.\docker.bat down
```

### 🔄 Restart the Application
```powershell
.\docker.bat restart
```

## Complete Commands Reference

### Using docker.bat (Simplified - Recommended)

#### Basic Operations
```powershell
.\docker.bat build    # Build Docker images
.\docker.bat up       # Start production environment  
.\docker.bat down     # Stop production environment
.\docker.bat restart  # Restart all services
.\docker.bat status   # Show container status
```

#### Development vs Production
```powershell
# Production Mode (faster, optimized)
.\docker.bat up       # Frontend: http://localhost, Backend: http://localhost:5000

# Development Mode (live reloading, debugging)
.\docker.bat dev      # Frontend: http://localhost:3000, Backend: http://localhost:5000
.\docker.bat dev-down # Stop development mode
```

#### Monitoring and Maintenance
```powershell
.\docker.bat logs           # View all logs
.\docker.bat logs frontend  # View frontend logs only
.\docker.bat logs backend   # View backend logs only
.\docker.bat clean          # ⚠️ Remove everything and clean up
```

### Using docker-compose (Direct Commands)

#### Building and Starting

#### Start in Background (Recommended)
```powershell
docker-compose up -d
```
- Runs the app in the background
- You can close the terminal and the app keeps running
- Access at: http://localhost

#### Start with Live Logs
```powershell
docker-compose up
```
- Shows real-time logs from both frontend and backend
- Press `Ctrl + C` to stop

#### Force Rebuild and Start
```powershell
docker-compose up --build
```
- Use this when you've made code changes
- Rebuilds the Docker images before starting

#### Development Mode
```powershell
docker-compose -f docker-compose.dev.yml up -d
```
- Uses development configuration
- Enables live code reloading
- Frontend: http://localhost:3000

### Stopping and Cleaning

#### Stop the Application
```powershell
docker-compose down
```
- Stops and removes containers
- Keeps your data and images

#### Stop and Remove Everything
```powershell
docker-compose down --volumes --rmi all
```
- ⚠️ **Warning**: This deletes all data and images
- Use only if you want a completely fresh start

### Viewing Information

#### Check if App is Running
```powershell
docker-compose ps
```
- Shows status of all containers

#### View Live Logs
```powershell
docker-compose logs -f
```
- Shows logs from all services
- Press `Ctrl + C` to exit

#### View Logs for Specific Service
```powershell
# Backend logs only
docker-compose logs -f backend

# Frontend logs only  
docker-compose logs -f frontend
```

### Maintenance Commands

#### Update to Latest Code
```powershell
# 1. Stop the application
docker-compose down

# 2. Pull latest code (if using git)
git pull

# 3. Rebuild and start
docker-compose up --build
```

#### Check Resource Usage
```powershell
docker stats
```
- Shows CPU, memory, and network usage
- Press `Ctrl + C` to exit

#### Clean Up Unused Resources
```powershell
docker system prune
```
- Removes unused containers, networks, and images
- Frees up disk space

## Key Differences: docker.bat vs docker-compose

### `.\docker.bat` (Recommended for Beginners)
✅ **Pros:**
- **Simpler commands**: `.\docker.bat up` vs `docker-compose up -d`
- **Built-in help**: Shows usage when run without arguments
- **Friendly messages**: "Application started! Frontend: http://localhost"
- **Windows optimized**: Designed specifically for Windows PowerShell
- **Two modes**: Separate production and development environments
- **Safety features**: Clear confirmation messages

❌ **Cons:**
- Windows only (won't work on Mac/Linux)
- Less flexible than direct docker-compose

### `docker-compose` (Direct Commands)
✅ **Pros:**
- **Universal**: Works on Windows, Mac, and Linux
- **More control**: Full access to all docker-compose features
- **Industry standard**: What most developers use
- **Flexible**: Can customize any parameter

❌ **Cons:**
- More complex commands to remember
- No built-in help messages
- Requires knowledge of docker-compose syntax

## When to Use Which?

### Use `.\docker.bat` when:
- You're new to Docker
- You want simple, memorable commands
- You're on Windows
- You want clear feedback messages
- You need quick development vs production switching

### Use `docker-compose` when:
- You're experienced with Docker
- You need custom configurations
- You're on Mac/Linux
- You're following online tutorials
- You need advanced Docker features

## Environment Configuration

### For Development (Default)
No additional setup needed. The app runs on:
- Frontend: http://localhost (port 80)
- Backend API: http://localhost:5000

### For Production
1. Copy environment files:
   ```powershell
   cp .env.example .env
   cp server/.env.example server/.env
   ```

2. Edit the `.env` files with your production values:
   - Database connection string
   - JWT secret key
   - Email configuration

3. Start with production settings:
   ```powershell
   docker-compose up -d
   ```

## Troubleshooting

### App Won't Start
1. **Check if ports are available:**
   ```powershell
   netstat -ano | findstr :80
   netstat -ano | findstr :5000
   ```
   If ports are in use, stop other applications or change ports in `docker-compose.yml`

2. **Rebuild everything:**
   ```powershell
   docker-compose down
   docker-compose up --build
   ```

### Can't Access the Website
1. **Verify containers are running:**
   ```powershell
   docker-compose ps
   ```
   Both services should show "Up" status

2. **Check logs for errors:**
   ```powershell
   docker-compose logs
   ```

3. **Try different browser or incognito mode**

### Out of Disk Space
```powershell
# Remove unused Docker resources
docker system prune -a

# Remove all stopped containers
docker container prune

# Remove unused images
docker image prune -a
```

### Database Connection Issues
1. **Check your `.env` files have correct database connection string**
2. **Restart the backend:**
   ```powershell
   docker-compose restart backend
   ```

## Daily Workflow

### Start Your Day
```powershell
cd path\to\Nurtura

# For regular use (production mode)
.\docker.bat up

# For development (if making code changes)
.\docker.bat dev
```

### During Development
```powershell
# When you make code changes (production mode)
.\docker.bat down
.\docker.bat build
.\docker.bat up

# When using development mode (auto-reloads)
# No rebuild needed - changes are live!
.\docker.bat logs  # Watch for errors
```

### End of Day
```powershell
.\docker.bat down
```

### Check Status Anytime
```powershell
.\docker.bat status
```

## 🧪 Testing Your Docker Application

### Quick Testing Commands
```powershell
# Test everything before containerizing
.\docker.bat test-local

# Test running containers  
.\docker.bat test-containers

# Test end-to-end functionality
.\docker.bat test-e2e

# Run complete test suite
.\docker.bat test-all
```

### Testing Strategy
1. **Local Testing** (fastest) - Test before Docker
2. **Container Testing** - Test inside running containers  
3. **E2E Testing** - Test complete application workflow
4. **Integration Testing** - Test full Docker stack

**Detailed Testing Guide**: See `DOCKER_TESTING_GUIDE.md` for comprehensive testing instructions.

## Advanced Tips

### Run Commands Inside Containers
```powershell
# Access backend container shell
docker-compose exec backend bash

# Access frontend container shell  
docker-compose exec frontend sh
```

### Backup Your Data
```powershell
# Create backup of database volume
docker run --rm -v nurtura_mongodb_data:/data -v ${PWD}:/backup ubuntu tar czf /backup/db-backup.tar.gz /data
```

### Monitor Performance
```powershell
# Real-time resource monitoring
docker stats

# Container health status
docker-compose ps
```

## Getting Help

- **View this guide**: Located at `DOCKER_GUIDE.md` in your project
- **Check Docker status**: `docker-compose ps`
- **View application logs**: `docker-compose logs`
- **Docker documentation**: https://docs.docker.com/

---

**Remember**: Always run these commands from the Nurtura project directory where `docker-compose.yml` is located!
