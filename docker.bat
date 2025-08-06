@echo off
echo ============================================
echo  Nurtura Docker Management
echo ============================================
echo.

if "%1"=="build" (
    echo Building microservices...
    docker-compose build
    goto :end
)

if "%1"=="up" (
    echo Starting microservices...
    docker-compose up -d
    echo.
    echo Application started in microservices mode!
    echo.
    echo Frontend: http://localhost
    echo Backend API: http://localhost:5000
    echo AI Moderation: http://localhost:8001
    echo.
    echo Health checks:
    echo - Web App: http://localhost:5000/health
    echo - AI Service: http://localhost:8001/health
    goto :end
)

if "%1"=="down" (
    echo Stopping microservices...
    docker-compose down
    goto :end
)

if "%1"=="logs" (
    if "%2"=="" (
        docker-compose logs -f
    ) else (
        docker-compose logs -f %2
    )
    goto :end
)

if "%1"=="test-ai" (
    echo Testing AI moderation service...
    curl -X POST http://localhost:8001/ ^
         -H "Content-Type: application/json" ^
         -d "{\"text\": \"This is a test message\", \"type\": \"comment\"}"
    goto :end
)

echo Usage: %0 [build^|up^|down^|logs^|test-ai]
echo.
echo Commands:
echo   build     - Build all microservice containers
echo   up        - Start all microservices
echo   down      - Stop all microservices  
echo   logs      - Show logs (optional: specify service name)
echo   test-ai   - Test AI moderation service
echo.
echo Examples:
echo   %0 build
echo   %0 up
echo   %0 logs ai-moderation
echo   %0 test-ai

:end
