@echo off
setlocal enabledelayedexpansion

echo ============================================
echo  Nurtura Docker Management
echo ============================================

if "%~1"=="" goto help
if "%~1"=="build" goto build
if "%~1"=="up" goto up
if "%~1"=="down" goto down
if "%~1"=="logs" goto logs
if "%~1"=="restart" goto restart
if "%~1"=="clean" goto clean
if "%~1"=="status" goto status
if "%~1"=="health" goto health
if "%~1"=="test-ai" goto test_ai
if "%~1"=="ps" goto status
goto help

:build
echo Building microservices...
docker-compose build
goto end

:up
echo Starting microservices...
docker-compose up -d
echo.
echo Application started in microservices mode!
echo Frontend: http://localhost
echo Backend API: http://localhost:5000
echo AI Moderation: http://localhost:8001
echo.
echo Health checks:
echo - Web App: http://localhost:5000/health
echo - AI Service: http://localhost:8001/health
goto end

:down
echo Stopping microservices...
docker-compose down
goto end

:logs
if "%~2"=="" (
    echo Showing logs for all services...
    docker-compose logs -f
) else (
    echo Showing logs for service: %~2
    docker-compose logs -f %~2
)
goto end

:restart
echo Restarting microservices...
docker-compose restart
echo Microservices restarted!
goto end

:clean
echo Cleaning up Docker resources...
echo Stopping containers...
docker-compose down -v
echo Removing unused images...
docker image prune -f
echo Removing unused volumes...
docker volume prune -f
echo Removing unused networks...
docker network prune -f
echo Cleanup completed!
goto end

:status
echo Docker containers status:
docker-compose ps
echo.
echo System resource usage:
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"
goto end

:health
echo Checking service health...
echo.
echo Web App Health:
powershell -Command "try { $response = Invoke-RestMethod -Uri 'http://localhost:5000/health' -TimeoutSec 5; Write-Host 'Status:' $response.status 'Uptime:' $response.uptime 's' } catch { Write-Host 'Web app not responding or not started' }"
echo.
echo AI Service Health:
powershell -Command "try { $response = Invoke-RestMethod -Uri 'http://localhost:8001/health' -TimeoutSec 5; Write-Host 'Status:' $response.status 'Model Loaded:' $response.model_loaded 'Uptime:' $response.uptime } catch { Write-Host 'AI service not responding or not started' }"
goto end

:test_ai
echo Testing AI moderation service...
echo Testing with normal message...
powershell -Command "try { $body = @{text='This is a normal test message'} | ConvertTo-Json; $response = Invoke-RestMethod -Uri 'http://localhost:8001/moderate' -Method POST -ContentType 'application/json' -Body $body; Write-Host 'Result: Allowed=' $response.allowed 'Confidence=' $response.overall_confidence } catch { Write-Host 'AI service test failed - ensure service is running' }"
goto end

:help
echo Usage: %0 {build^|up^|down^|logs^|restart^|clean^|status^|health^|test-ai^|ps}
echo.
echo Commands:
echo   build     - Build all microservice containers
echo   up        - Start all microservices
echo   down      - Stop all microservices
echo   logs      - Show logs (optional: specify service name)
echo   restart   - Restart all microservices
echo   clean     - Clean up Docker resources (containers, images, volumes)
echo   status    - Show container status and resource usage
echo   ps        - Alias for status
echo   health    - Check health of all services
echo   test-ai   - Test AI moderation service functionality
echo.
echo Examples:
echo   %0 build
echo   %0 up
echo   %0 logs webapp
echo   %0 logs ai-moderation
echo   %0 restart
echo   %0 clean
echo   %0 health
echo   %0 test-ai
echo.
echo Available services: frontend, webapp, ai-moderation

:end
