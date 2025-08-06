# Auto-Moderation Integration Guide

## 🛡️ Overview
This auto-moderation system uses the MetaHateBERT model to detect and filter inappropriate content (hate speech, toxic comments) before they are saved to the database.

## 📁 File Structure
```
Nurtura/
├── automod/
│   ├── .env                    # Model configuration
│   ├── requirements.txt        # Python dependencies
│   ├── infer.py               # Original inference script
│   ├── moderationService.py   # Main moderation service
│   ├── moderate_cli.py        # CLI interface for Node.js
│   └── test_moderation.py     # Test script
└── server/
    ├── middleware/
    │   └── moderationMiddleware.js  # Express middleware
    └── routes/
        ├── threads.js         # Modified with moderation
        └── comment.js         # Modified with moderation
```

## 🚀 Setup Instructions

### 1. Install Python Dependencies
```bash
cd automod
pip install -r requirements.txt
```

### 2. Test the Moderation System
```bash
cd automod
python test_moderation.py
```

### 3. Enable/Disable Moderation
In `server/.env`:
```
ENABLE_MODERATION=true    # Enable moderation
ENABLE_MODERATION=false   # Disable moderation
```

### 4. Configure Threshold
In `automod/.env`:
```
HATE_THRESHOLD=0.7  # Confidence threshold (0.0-1.0)
```

## 🔧 How It Works

1. **User submits content** (thread/comment)
2. **Moderation middleware** intercepts the request
3. **Python script** analyzes content using MetaHateBERT
4. **Decision made**: Allow or block based on confidence threshold
5. **Response sent** to user with appropriate message

## 📊 Configuration Options

### Threshold Settings
- `0.5` - Very sensitive (blocks more content)
- `0.7` - Balanced (recommended)
- `0.9` - Very permissive (blocks only obvious hate speech)

### Environment Variables
- `ENABLE_MODERATION`: Enable/disable the system
- `PYTHON_PATH`: Path to Python executable
- `HATE_THRESHOLD`: Confidence threshold for blocking

## 🧪 Testing

### Test Individual Messages
```python
from moderationService import ContentModerator
moderator = ContentModerator()
moderator.load_model()

result = moderator.predict_hate_speech("Your test message here")
print(result)
```

### Test Full Content Moderation
```bash
python test_moderation.py
```

## 🛡️ Security Features

1. **Fail-safe**: If moderation fails, content is allowed (no false blocks)
2. **Logging**: All moderation decisions are logged
3. **Threshold-based**: Configurable sensitivity
4. **Performance**: Non-blocking with async processing

## 🔍 API Response Examples

### Allowed Content
```json
{
  "message": "Thread created successfully",
  "data": { "threadId": "..." }
}
```

### Blocked Content
```json
{
  "message": "Content blocked by moderation system",
  "reason": "Inappropriate content detected (confidence: 0.85)",
  "details": {
    "predictions": {
      "title": { "label": "NOT_HATE", "confidence": 0.12 },
      "content": { "label": "HATE", "confidence": 0.85 }
    }
  }
}
```

## 🚨 Troubleshooting

### Model Loading Issues
- Check Python path in server/.env
- Verify transformers and torch are installed
- Check internet connection for model download

### Performance Issues
- Model loads once on first use (30-60 seconds)
- Consider pre-loading model on server startup
- Monitor memory usage (model requires ~1GB RAM)

### False Positives
- Adjust HATE_THRESHOLD in automod/.env
- Review moderation logs for patterns
- Consider adding allow-list for specific terms

## 📈 Monitoring

Check server logs for:
- `Thread moderation result:` - Thread moderation decisions
- `Comment moderation result:` - Comment moderation decisions
- `Python moderation script error:` - System errors

## 🔄 Updates

To update the model:
1. Change MODEL in `automod/.env`
2. Restart server to reload model
3. Test with new content samples
