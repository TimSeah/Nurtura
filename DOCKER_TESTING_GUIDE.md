# Docker Testing Guide for Nurtura

This guide explains how to run different types of tests within Docker containers and ensure your application works correctly in the containerized environment.

## 🚨 Important: Production vs Development Containers

### **Why Tests Fail in Production Containers**

Production Docker containers are **optimized for security and efficiency**:

- **Frontend**: Uses nginx (no Node.js, no npm, no test dependencies)
- **Backend**: Uses `npm ci --only=production` (no dev dependencies, no jest)

This is **intentional and correct** for production!

### **Solutions for Testing**

**Option 1: Development Containers (Recommended)**
```powershell
.\docker.bat test-containers  # Uses development containers automatically
```

**Option 2: Temporary Test Containers**
```powershell
.\docker.bat test-prod       # Creates temporary containers with test dependencies
```

**Option 3: Local Testing (Fastest)**
```powershell
.\docker.bat test-local      # Test on your local machine
```

## 🧪 Testing Overview

There are several approaches to testing Docker applications:

1. **Local Testing** (recommended for development)
2. **Container Testing** (testing inside running containers)
3. **Integration Testing** (testing the full containerized stack)
4. **CI/CD Testing** (automated testing in build pipelines)

## 🚀 Quick Testing Commands

### Using docker.bat (Simplified)
```powershell
# Test the application locally before containerizing
.\docker.bat test-local

# Test running containers
.\docker.bat test-containers

# Run end-to-end tests against Docker containers
.\docker.bat test-e2e

# Full test suite (local + container + e2e)
.\docker.bat test-all
```

### Using Docker Compose (Direct)
```powershell
# Test individual services
docker-compose exec frontend npm test
docker-compose exec backend npm test

# Run Cypress tests against containerized app
docker-compose run --rm cypress
```

## 🔬 Testing Methods Explained

### 1. Local Testing (Before Docker)

**Recommended approach for development:**

```powershell
# Frontend tests (Jest + Vitest)
npm test                    # All frontend tests
npm run test:jest          # React component tests
npm run test:vitest        # Utility function tests

# Backend tests
cd server
npm test                   # Backend API tests

# End-to-end tests (requires running servers)
npm run dev                # Terminal 1: Start frontend
cd server && npm run dev   # Terminal 2: Start backend
npm run cy:run            # Terminal 3: Run Cypress tests
```

### 2. Container Testing (Inside Running Containers)

**Test services running in Docker:**

```powershell
# Start containers first
.\docker.bat up

# Run tests inside containers
docker-compose exec frontend npm test
docker-compose exec backend npm test

# Or using our enhanced docker.bat
.\docker.bat test-containers
```

### 3. Integration Testing (Full Docker Stack)

**Test the complete containerized application:**

```powershell
# Start the full application
.\docker.bat up

# Run Cypress tests against containers
.\docker.bat test-e2e

# This tests:
# - Frontend served by nginx
# - Backend API responses
# - Database connectivity
# - Inter-service communication
```

## 📝 Testing Scenarios

### Development Workflow Testing

```powershell
# 1. Test locally first (fast feedback)
npm test
cd server && npm test

# 2. Test in containers (environment validation)
.\docker.bat up
.\docker.bat test-containers

# 3. Test end-to-end (full integration)
.\docker.bat test-e2e
```

### Production Readiness Testing

```powershell
# 1. Build production containers
.\docker.bat build

# 2. Start production environment
.\docker.bat up

# 3. Run comprehensive tests
.\docker.bat test-all

# 4. Performance testing
docker stats  # Monitor resource usage
```

### Specific Test Types

#### Frontend Unit Tests (Jest)
```powershell
# Local testing
npm run test:jest

# Container testing
docker-compose exec frontend npm run test:jest
```

#### Frontend Utility Tests (Vitest)
```powershell
# Local testing
npm run test:vitest

# Container testing
docker-compose exec frontend npm run test:vitest
```

#### Backend API Tests
```powershell
# Local testing
cd server && npm test

# Container testing
docker-compose exec backend npm test
```

#### End-to-End Tests (Cypress)
```powershell
# Against local servers
npm run cy:run

# Against Docker containers
.\docker.bat test-e2e
```

## 🐛 Debugging Failed Tests

### Container Logs
```powershell
# View all logs
.\docker.bat logs

# View specific service logs
docker-compose logs frontend
docker-compose logs backend

# Follow logs in real-time
docker-compose logs -f
```

### Interactive Debugging
```powershell
# Access container shell for debugging
docker-compose exec frontend sh
docker-compose exec backend bash

# Run tests manually inside container
docker-compose exec frontend npm test -- --verbose
docker-compose exec backend npm test -- --verbose
```

### Network Testing
```powershell
# Test container connectivity
docker-compose exec frontend ping backend
docker-compose exec backend ping frontend

# Test external access
curl http://localhost        # Frontend
curl http://localhost:5000   # Backend API
```

## ⚙️ Environment-Specific Testing

### Development Environment
```powershell
# Use development docker-compose
.\docker.bat dev

# Test development setup
docker-compose -f docker-compose.dev.yml exec frontend-dev npm test
docker-compose -f docker-compose.dev.yml exec backend-dev npm test
```

### Production Environment
```powershell
# Use production docker-compose
.\docker.bat up

# Test production build
docker-compose exec frontend nginx -t  # Nginx config test
docker-compose exec backend npm test   # Backend tests
```

## 🎯 Testing Best Practices

### 1. Test Pyramid
```
End-to-End Tests (Few)     ← Cypress (Slow, High confidence)
    ↑
Integration Tests (Some)   ← Docker container tests (Medium)
    ↑
Unit Tests (Many)         ← Jest/Vitest (Fast, Low confidence)
```

### 2. Testing Strategy
1. **Write unit tests first** (fast feedback)
2. **Test in containers** (environment validation)
3. **Run E2E tests** (user workflow validation)
4. **Monitor in production** (real-world validation)

### 3. When to Use Each Method

**Local Testing:**
- ✅ During active development
- ✅ Quick feedback loop
- ✅ Debugging specific functions

**Container Testing:**
- ✅ Before pushing to git
- ✅ Environment validation
- ✅ Production-like testing

**E2E Testing:**
- ✅ Before releases
- ✅ User workflow validation
- ✅ Integration verification

## 🚨 Common Issues & Solutions

### Issue: Tests Pass Locally but Fail in Docker
```powershell
# Solution: Check environment differences
docker-compose exec frontend env | grep NODE_ENV
docker-compose exec backend env | grep NODE_ENV

# Compare with local environment
printenv | grep NODE_ENV
```

### Issue: Cypress Can't Connect to Application
```powershell
# Solution: Verify containers are running and accessible
.\docker.bat status
curl http://localhost      # Should return frontend
curl http://localhost:5000 # Should return backend API

# Check cypress configuration points to correct URLs
# baseUrl should be http://localhost for Docker setup
```

### Issue: Database Tests Failing
```powershell
# Solution: Check database connectivity
docker-compose exec backend node -e "
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('DB Connected'))
  .catch(err => console.error('DB Error:', err));
"
```

### Issue: Port Conflicts During Testing
```powershell
# Solution: Use different ports for testing
# Create docker-compose.test.yml with different port mappings
# Or stop other services using the same ports
netstat -ano | findstr :80
netstat -ano | findstr :5000
```

## 📊 Monitoring Test Results

### Test Coverage
```powershell
# Frontend coverage
npm run test:coverage

# Backend coverage
cd server && npm run test:coverage

# View coverage reports
# Frontend: coverage/lcov-report/index.html
# Backend: server/coverage/lcov-report/index.html
```

### Performance Monitoring
```powershell
# Monitor during testing
docker stats

# Check resource usage
docker-compose exec frontend ps aux
docker-compose exec backend ps aux
```

## 🔄 Continuous Integration

### GitHub Actions Example
```yaml
# .github/workflows/test.yml
name: Test Docker Application
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Build containers
        run: docker-compose build
      - name: Start application
        run: docker-compose up -d
      - name: Run tests
        run: |
          docker-compose exec -T frontend npm test
          docker-compose exec -T backend npm test
      - name: Run E2E tests
        run: docker-compose run --rm cypress
```

---

**Remember**: Always test your Docker containers in an environment as close to production as possible!
