@echo off
REM Production setup script for Auto-Moderation Webapp
REM This script prepares the moderation service for integration with the main webapp

echo ========================================
echo Auto-Moderation Production Setup
echo ========================================
echo.

REM Check if we're in the right directory
if not exist "moderationService.py" (
    echo ERROR: This script must be run from the automod directory
    echo Expected files: moderationService.py, requirements.txt
    pause
    exit /b 1
)

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python not found! 
    echo Please install Python 3.8+ first: https://www.python.org/downloads/
    pause
    exit /b 1
)

echo [1/5] Python found
python --version
echo.

REM Setup virtual environment
echo [2/5] Setting up virtual environment...
if exist "venv" (
    echo   Removing existing virtual environment...
    rmdir /s /q venv
)

python -m venv venv
if errorlevel 1 (
    echo ERROR: Failed to create virtual environment
    pause
    exit /b 1
)
echo   Virtual environment created
echo.

REM Install dependencies
echo [3/5] Installing dependencies...
call venv\Scripts\activate.bat
python -m pip install --upgrade pip >nul 2>&1
pip install -r requirements.txt
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo   Dependencies installed successfully
echo.

REM Configure environment
echo [4/5] Configuring environment...
if not exist ".env" (
    if exist ".env.example" (
        copy ".env.example" ".env" >nul
        echo   Created .env from template
    ) else (
        echo WARNING: No .env.example found, creating basic .env
        echo MODEL=irlab-udc/MetaHateBERT > .env
        echo HATE_THRESHOLD=0.7 >> .env
        echo ENABLE_MODERATION=true >> .env
        echo MODERATION_SERVICE_PORT=8001 >> .env
        echo MODERATION_IDLE_TIMEOUT=30 >> .env
    )
) else (
    echo   .env file already exists
)
echo.

REM Test the moderation service
echo [5/5] Testing moderation service...
echo   Loading AI model (this may take a moment)...
python -c "import sys, os; sys.path.append('.'); from moderationService import initialize_moderation_service; print('   AI model loaded successfully') if initialize_moderation_service() else print('   ERROR: Failed to load AI model') or sys.exit(1)" 2>nul
if errorlevel 1 (
    echo ERROR: Moderation service test failed
    echo Check that all dependencies are installed correctly
    pause
    exit /b 1
)
echo.

echo ========================================
echo   PRODUCTION SETUP COMPLETE!
echo ========================================
echo.
echo The auto-moderation service is ready for webapp integration.
echo.
echo NEXT STEPS:
echo 1. Configure your Node.js webapp environment:
echo    - Set ENABLE_MODERATION=true
echo    - Set USE_PERSISTENT_MODERATION=true  
echo    - Set MODERATION_SERVICE_PORT=8001
echo    - Set PYTHON_PATH=python
echo.
echo 2. Start the moderation service:
echo    manage_service.bat start
echo.
echo 3. The service will be available at:
echo    http://localhost:8001
echo.
echo FILES INCLUDED:
echo   moderationService.py  - Core moderation logic
echo   moderation_server.py  - HTTP service
echo   moderate_cli.py       - CLI interface
echo   config.py            - Configuration management
echo   manage_service.bat    - Service control
echo   .env                 - Environment configuration
echo   requirements.txt     - Python dependencies
echo   venv/               - Virtual environment
echo.