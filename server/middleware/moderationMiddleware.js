// Moderation middleware for Express.js routes
const { spawn } = require('child_process');
const path = require('path');

class ForumModerator {
  constructor() {
    this.moderationEnabled = process.env.ENABLE_MODERATION === 'true';
    this.pythonPath = process.env.PYTHON_PATH || 'python';
    this.scriptPath = path.join(__dirname, '../../automod/moderate_cli.py'); // Updated path
    console.log('🔧 ForumModerator initialized');
    console.log('🐍 Python path:', this.pythonPath);
    console.log('📄 Script path:', this.scriptPath);
    console.log('🛡️ Moderation enabled:', this.moderationEnabled);
  }

  async moderateContent(contentData) {
    console.log('🔍 moderateContent called with:', contentData);
    
    if (!this.moderationEnabled) {
      console.log('⏭️ Moderation disabled, allowing content');
      return { allowed: true, reason: 'Moderation disabled' };
    }

    console.log('🐍 Starting Python process...');
    
    return new Promise((resolve, reject) => {
      const python = spawn(this.pythonPath, [this.scriptPath]);
      let result = '';
      let error = '';

      // Send content data to Python script
      console.log('📤 Sending to Python:', JSON.stringify(contentData));
      python.stdin.write(JSON.stringify(contentData));
      python.stdin.end();

      python.stdout.on('data', (data) => {
        result += data.toString();
      });

      python.stderr.on('data', (data) => {
        error += data.toString();
      });

      python.on('close', (code) => {
        console.log('🔚 Python process closed with code:', code);
        console.log('📤 Python stdout:', result);
        
        if (error) {
          console.log('❌ Python stderr:', error);
        }
        
        if (code !== 0) {
          console.error('❌ Python moderation script error:', error);
          // Default to allowing content if moderation fails
          resolve({ allowed: true, reason: 'Moderation service unavailable' });
        } else {
          try {
            const moderationResult = JSON.parse(result);
            console.log('✅ Parsed moderation result:', moderationResult);
            resolve(moderationResult);
          } catch (e) {
            console.error('❌ Failed to parse moderation result:', e);
            resolve({ allowed: true, reason: 'Moderation parsing error' });
          }
        }
      });
    });
  }

  // Create user-friendly error messages
  createUserFriendlyMessage(moderationResult) {
    const messages = [
      "Your post contains content that may be inappropriate for our community.",
      "Please review our community guidelines and try rephrasing your message.",
      "We're committed to maintaining a respectful environment for all users."
    ];
    
    // You could customize messages based on confidence level or content type
    const confidence = moderationResult.overall_confidence || 0;
    
    if (confidence > 0.9) {
      return "Your post contains language that violates our community standards. " + messages[1];
    } else if (confidence > 0.8) {
      return messages[0] + " " + messages[1];
    } else {
      return messages[0] + " " + messages[2];
    }
  }

  // Middleware function for Express routes
  moderationMiddleware() {
    return async (req, res, next) => {
      console.log('🛡️ Moderation middleware called');
      console.log('📥 Request body:', JSON.stringify(req.body));
      
      try {
        const contentData = {
          title: req.body.title,
          content: req.body.content,
          author: req.body.author
        };

        console.log('🔍 Content to moderate:', contentData);

        const moderationResult = await this.moderateContent(contentData);
        
        console.log('✅ Moderation completed:', moderationResult);

        if (!moderationResult.allowed) {
          console.log('🚫 Content blocked:', moderationResult.blocked_reason);
          
          // Create user-friendly error message
          const userMessage = this.createUserFriendlyMessage(moderationResult);
          
          return res.status(400).json({
            success: false,
            message: userMessage,
            code: 'CONTENT_MODERATED',
            timestamp: new Date().toISOString(),
            // Include technical details for debugging (can be hidden from UI)
            debug: {
              reason: moderationResult.blocked_reason,
              predictions: moderationResult.predictions
            }
          });
        }

        // Add moderation results to request for logging
        req.moderationResult = moderationResult;
        console.log('✅ Content allowed, proceeding');
        next();
      } catch (error) {
        console.error('❌ Moderation middleware error:', error);
        // In case of error, allow content but log the issue
        next();
      }
    };
  }
}

module.exports = new ForumModerator();
