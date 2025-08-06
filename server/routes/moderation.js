const express = require('express');
const router = express.Router();
const moderator = require('../middleware/moderationMiddleware');

console.log('🔧 Moderation router loaded');

// Test endpoint for moderation
router.post('/test-moderation', async (req, res) => {
  try {
    console.log('🧪 Testing moderation with:', req.body);
    
    const contentData = {
      title: req.body.title || '',
      content: req.body.content || '',
      author: req.body.author || 'TestUser'
    };

    const result = await moderator.moderateContent(contentData);
    
    res.json({
      success: true,
      input: contentData,
      moderation_result: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Moderation test error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Get moderation status
router.get('/moderation-status', (req, res) => {
  console.log('📊 Moderation status requested');
  res.json({
    enabled: process.env.ENABLE_MODERATION === 'true',
    model: process.env.MODEL || 'irlab-udc/MetaHateBERT',
    threshold: parseFloat(process.env.HATE_THRESHOLD || '0.7'),
    python_path: process.env.PYTHON_PATH || 'python'
  });
});

console.log('✅ Moderation router exported');
module.exports = router;
