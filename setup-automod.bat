@echo off
REM Setup script for auto-moderation feature (Windows)

echo 🚀 Setting up Auto-Moderation feature...

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed. Please install Python 3.8+ first.
    exit /b 1
)

REM Install Python dependencies
echo 📦 Installing Python dependencies...
cd automod
pip install -r requirements.txt

REM Test the moderation service
echo 🧪 Testing moderation service...
python -c "import json; from moderationService import initialize_moderation_service, moderate_forum_content; print('Initializing moderation service...'); result = initialize_moderation_service(); print('✅ Model loaded successfully' if result else '❌ Failed to initialize moderation service'); test_content = {'title': 'Welcome to our forum', 'content': 'This is a friendly message', 'author': 'TestUser'}; mod_result = moderate_forum_content(test_content) if result else None; print('✅ Test moderation result:', json.dumps(mod_result, indent=2)) if mod_result else None"

echo ✅ Auto-moderation setup complete!
echo.
echo 📝 Next steps:
echo 1. Copy .env.example to .env and configure your settings
echo 2. Set ENABLE_MODERATION=true in your .env file  
echo 3. Restart your Node.js server
echo 4. Test by creating forum posts and comments

pause
