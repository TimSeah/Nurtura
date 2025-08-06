#!/bin/bash
# Setup script for auto-moderation feature

echo "🚀 Setting up Auto-Moderation feature..."

# Check if Python is available
if ! command -v python &> /dev/null; then
    echo "❌ Python is not installed. Please install Python 3.8+ first."
    exit 1
fi

# Install Python dependencies
echo "📦 Installing Python dependencies..."
cd automod
pip install -r requirements.txt

# Test the moderation service
echo "🧪 Testing moderation service..."
python -c "
import json
from moderationService import initialize_moderation_service, moderate_forum_content

print('Initializing moderation service...')
if initialize_moderation_service():
    print('✅ Model loaded successfully')
    
    # Test content
    test_content = {
        'title': 'Welcome to our forum',
        'content': 'This is a friendly message',
        'author': 'TestUser'
    }
    
    result = moderate_forum_content(test_content)
    print('✅ Test moderation result:', json.dumps(result, indent=2))
else:
    print('❌ Failed to initialize moderation service')
"

echo "✅ Auto-moderation setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Copy .env.example to .env and configure your settings"
echo "2. Set ENABLE_MODERATION=true in your .env file"
echo "3. Restart your Node.js server"
echo "4. Test by creating forum posts and comments"
