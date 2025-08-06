@echo off
setlocal enabledelayedexpansion

REM Nurtura Docker Management Script for Windows

if "%~1"=="" goto help
if "%~1"=="build" goto build
if "%~1"=="up" goto up  
if "%~1"=="down" goto down
if "%~1"=="dev" goto dev
if "%~1"=="dev-down" goto dev_down
if "%~1"=="logs" goto logs
if "%~1"=="restart" goto restart
if "%~1"=="clean" goto clean
if "%~1"=="status" goto status
if "%~1"=="test-local" goto test_local
if "%~1"=="test-containers" goto test_containers
if "%~1"=="test-containers-safe" goto test_containers_safe
if "%~1"=="test-prod" goto test_prod
if "%~1"=="test-e2e" goto test_e2e
if "%~1"=="test-all" goto test_all
goto help

:build
echo Building Docker images...
docker-compose build
goto end

:up
echo Starting Nurtura application...
docker-compose up -d
echo Application started! Frontend: http://localhost, Backend: http://localhost:5000
goto end

:down
echo Stopping Nurtura application...
docker-compose down
goto end

:dev
echo Starting development environment...
docker-compose -f docker-compose.dev.yml up -d
echo Development environment started! 
echo Frontend: http://localhost:3000 (Vite dev server)
echo Backend: http://localhost:5001 (Development API)
echo Note: Different ports than production to avoid conflicts
goto end

:dev_down
echo Stopping development environment...
docker-compose -f docker-compose.dev.yml down
goto end

:logs
if "%~2"=="" (
    docker-compose logs -f
) else (
    docker-compose logs -f %~2
)
goto end

:restart
echo Restarting Nurtura application...
docker-compose restart
goto end

:clean
echo Cleaning up Docker resources...
docker-compose down -v --rmi all
docker system prune -f
goto end

:status
echo Docker containers status:
docker-compose ps
goto end

:test_local
echo Running local tests before Docker...
echo Testing frontend...
npm test
echo Testing backend...
cd server
npm test
cd ..
echo Local tests completed!
goto end

:test_containers
echo Running tests inside Docker containers...
echo.
echo Note: Production containers don't have test dependencies.
echo Using development containers for testing on different ports...
echo.
echo Starting development environment on ports 3000 and 5001...
docker-compose -f docker-compose.dev.yml down --remove-orphans
docker-compose -f docker-compose.dev.yml up -d
echo.
echo Waiting for containers to be ready...
timeout /t 10 /nobreak > nul
echo.
echo Testing frontend development container...
docker-compose -f docker-compose.dev.yml exec frontend-dev npm test
echo.
echo Testing backend development container...
docker-compose -f docker-compose.dev.yml exec backend-dev npm test
echo.
echo Development containers info:
echo Frontend: http://localhost:3000, Backend: http://localhost:5001
echo Container tests completed!
goto end

:test_containers_safe
echo Running tests in temporary test containers...
echo Note: This approach doesn't interfere with running containers.
echo.
echo Building temporary test containers...
docker build -f Dockerfile.dev -t nurtura-frontend-test .
docker build -f server/Dockerfile.test -t nurtura-backend-test ./server
echo.
echo Running frontend tests...
docker run --rm -e CI=true nurtura-frontend-test npm test -- --watchAll=false
echo.
echo Running backend tests...
docker run --rm nurtura-backend-test npm test
echo.
echo Cleaning up test images...
docker rmi nurtura-frontend-test nurtura-backend-test 2>nul
echo Safe container tests completed!
goto end

:test_prod
echo Testing production containers with temporary test containers...
echo.
echo Creating temporary test containers with dev dependencies...
echo Building test containers...
docker build -f Dockerfile.dev -t nurtura-frontend-test .
docker build -f server/Dockerfile.test -t nurtura-backend-test ./server
echo.
echo Running frontend tests...
docker run --rm nurtura-frontend-test npm test
echo.
echo Running backend tests...
docker run --rm nurtura-backend-test npm test
echo.
echo Cleaning up test images...
docker rmi nurtura-frontend-test nurtura-backend-test
echo Production container tests completed!
goto end

:test_e2e
echo Running end-to-end tests against Docker containers...
echo Make sure containers are running first: .\docker.bat up
echo Running Cypress tests...
npm run cy:run
echo E2E tests completed!
goto end

:test_all
echo Running comprehensive test suite...
echo 1. Local tests...
call %0 test-local
echo 2. Starting containers...
call %0 up
echo 3. Container tests...
call %0 test-containers
echo 4. E2E tests...
call %0 test-e2e
echo All tests completed!
goto end

:help
echo Nurtura Docker Management
echo Usage: %0 {build^|up^|down^|dev^|dev-down^|logs^|restart^|clean^|status^|test-local^|test-containers^|test-containers-safe^|test-prod^|test-e2e^|test-all}
echo.
echo Commands:
echo   build                - Build Docker images
echo   up                   - Start production environment
echo   down                 - Stop production environment
echo   dev                  - Start development environment (ports 3000, 5001)
echo   dev-down             - Stop development environment
echo   logs                 - Show logs (optionally specify service name)
echo   restart              - Restart all services
echo   clean                - Clean up all Docker resources
echo   status               - Show container status
echo.
echo Testing Commands:
echo   test-local           - Run tests locally (before Docker)
echo   test-containers      - Run tests in development containers (ports 3000, 5001)
echo   test-containers-safe - Run tests in temporary containers (no port conflicts)
echo   test-prod            - Run tests with temporary production-like containers
echo   test-e2e             - Run Cypress E2E tests against containers
echo   test-all             - Run complete test suite (local + containers + e2e)
goto end

:end
