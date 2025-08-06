@echo off
REM Batch script to manage the persistent moderation service on Windows

set PYTHON_PATH=C:\Users\user\anaconda3\python.exe
set SCRIPT_DIR=%~dp0

if "%1"=="start" goto start
if "%1"=="stop" goto stop
if "%1"=="restart" goto restart
if "%1"=="status" goto status
if "%1"=="help" goto help

:help
echo Usage: manage_service.bat [start^|stop^|restart^|status^|help]
echo.
echo Commands:
echo   start    - Start the persistent moderation service
echo   stop     - Stop the persistent moderation service
echo   restart  - Restart the persistent moderation service
echo   status   - Check if the service is running
echo   help     - Show this help message
goto end

:start
echo 🚀 Starting persistent moderation service...
"%PYTHON_PATH%" "%SCRIPT_DIR%manage_service.py" start
goto end

:stop
echo 🛑 Stopping persistent moderation service...
"%PYTHON_PATH%" "%SCRIPT_DIR%manage_service.py" stop
goto end

:restart
echo 🔄 Restarting persistent moderation service...
"%PYTHON_PATH%" "%SCRIPT_DIR%manage_service.py" restart
goto end

:status
echo 📊 Checking service status...
"%PYTHON_PATH%" "%SCRIPT_DIR%manage_service.py" status
goto end

:end
