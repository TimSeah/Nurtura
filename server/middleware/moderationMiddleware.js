// Moderation middleware for Express.js routes
const { spawn } = require('child_process');
const path = require('path');

class ForumModerator {
  constructor() {
    this.moderationEnabled = process.env.ENABLE_MODERATION === 'true';
    this.usePersistentService = process.env.USE_PERSISTENT_MODERATION === 'true';
    this.servicePort = process.env.MODERATION_SERVICE_PORT || 8001;
    this.serviceUrl = `http://localhost:${this.servicePort}`;
    this.pythonPath = process.env.PYTHON_PATH || 'python';
    this.scriptPath = path.join(__dirname, '../../automod/moderate_cli.py');
    this.serviceProcess = null;
    
    console.log('🔧 ForumModerator initialized');
    console.log('🛡️ Moderation enabled:', this.moderationEnabled);
    console.log('🚀 Use persistent service:', this.usePersistentService);
    
    if (this.usePersistentService) {
      console.log('🌐 Service URL:', this.serviceUrl);
      this.startPersistentService();
    } else {
      console.log('🐍 Python path:', this.pythonPath);
      console.log('📄 Script path:', this.scriptPath);
    }
  }

  async startPersistentService() {
    try {
      console.log('� Starting persistent moderation service...');
      const serverPath = path.join(__dirname, '../../automod/moderation_server.py');
      
      this.serviceProcess = spawn(this.pythonPath, [serverPath], {
        env: {
          ...process.env,
          MODERATION_SERVICE_PORT: this.servicePort,
          MODERATION_IDLE_TIMEOUT: '30' // 30 minutes idle timeout
        }
      });

      this.serviceProcess.stdout.on('data', (data) => {
        console.log(`[ModerationService] ${data.toString().trim()}`);
      });

      this.serviceProcess.stderr.on('data', (data) => {
        console.error(`[ModerationService Error] ${data.toString().trim()}`);
      });

      this.serviceProcess.on('close', (code) => {
        console.log(`🔚 Moderation service exited with code ${code}`);
        this.serviceProcess = null;
      });

      // Wait a moment for service to start and test health with retries
      console.log('⏳ Waiting for service to start...');
      const isHealthy = await this.waitForServiceHealth(30000); // 30 second timeout
      
      if (isHealthy) {
        console.log('✅ Persistent moderation service is ready');
      } else {
        console.log('⚠️ Persistent service may not be ready, falling back to CLI mode');
        this.usePersistentService = false;
      }
    } catch (error) {
      console.error('❌ Failed to start persistent service:', error);
      this.usePersistentService = false;
    }
  }

  async checkServiceHealth() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(`${this.serviceUrl}/health`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  async waitForServiceHealth(maxWaitMs = 30000) {
    const startTime = Date.now();
    const checkInterval = 2000; // Check every 2 seconds
    
    while (Date.now() - startTime < maxWaitMs) {
      const isHealthy = await this.checkServiceHealth();
      if (isHealthy) {
        return true;
      }
      
      console.log('⏳ Service not ready yet, retrying...');
      await new Promise(resolve => setTimeout(resolve, checkInterval));
    }
    
    return false;
  }

  async moderateContentViaPersistentService(contentData) {
    try {
      console.log('🌐 Using persistent moderation service...');
      
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(this.serviceUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contentData),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Service responded with ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Persistent service result:', result);
      return result;
    } catch (error) {
      console.error('❌ Persistent service error:', error);
      // Fallback to CLI method
      console.log('🔄 Falling back to CLI moderation...');
      return this.moderateContentViaCLI(contentData);
    }
  }

  async moderateContentViaCLI(contentData) {
    console.log('🐍 Using CLI moderation (loading model each time)...');
    
    return new Promise((resolve, reject) => {
      const python = spawn(this.pythonPath, [this.scriptPath]);
      let result = '';
      let error = '';

      // Send content data to Python script
      python.stdin.write(JSON.stringify(contentData));
      python.stdin.end();

      python.stdout.on('data', (data) => {
        result += data.toString();
      });

      python.stderr.on('data', (data) => {
        error += data.toString();
      });

      python.on('close', (code) => {
        if (code !== 0) {
          console.error('❌ Python moderation script error:', error);
          resolve({ allowed: true, reason: 'Moderation service unavailable' });
        } else {
          try {
            const moderationResult = JSON.parse(result);
            console.log('✅ CLI moderation result:', moderationResult);
            resolve(moderationResult);
          } catch (e) {
            console.error('❌ Failed to parse moderation result:', e);
            resolve({ allowed: true, reason: 'Moderation parsing error' });
          }
        }
      });
    });
  }

  async moderateContent(contentData) {
    console.log('🔍 moderateContent called with:', contentData);
    
    if (!this.moderationEnabled) {
      console.log('⏭️ Moderation disabled, allowing content');
      return { allowed: true, reason: 'Moderation disabled' };
    }

    // Use persistent service if available, otherwise fall back to CLI
    if (this.usePersistentService) {
      return await this.moderateContentViaPersistentService(contentData);
    } else {
      return await this.moderateContentViaCLI(contentData);
    }
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
