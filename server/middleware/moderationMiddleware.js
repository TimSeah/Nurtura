// Moderation middleware       console.log('� Starting persistent moderation service...');or Express.js routes
const { spawn } = require('child_process');
const path = require('path');

class ForumModerator {
  constructor() {
    this.moderationEnabled = process.env.ENABLE_MODERATION === 'true';
    this.usePersistentService = process.env.USE_PERSISTENT_MODERATION === 'true';
    this.servicePort = process.env.MODERATION_SERVICE_PORT || 8001;
    
    // Support both local and external AI service
    this.serviceUrl = process.env.MODERATION_SERVICE_URL || `http://localhost:${this.servicePort}`;
    this.pythonPath = process.env.PYTHON_PATH || 'python';
    this.scriptPath = path.join(__dirname, '../../automod/moderate_cli.py');
    this.serviceProcess = null;
    
    // Only log moderation status in production
    if (this.moderationEnabled) {
      console.log('🛡️ Content moderation enabled');
      console.log(`📡 Moderation service: ${this.serviceUrl}`);
      
      // Only start local service if not using external service
      if (this.usePersistentService && !process.env.MODERATION_SERVICE_URL) {
        this.startPersistentService();
      }
    }

    // Setup cleanup handlers for graceful shutdown
    this.setupCleanupHandlers();
  }

  setupCleanupHandlers() {
    // Handle different shutdown signals
    const cleanup = () => {
      this.cleanup();
    };

    process.on('SIGINT', cleanup);  // Ctrl+C
    process.on('SIGTERM', cleanup); // Termination signal
    process.on('exit', cleanup);    // Normal exit
    process.on('uncaughtException', (error) => {
      console.error('Uncaught exception:', error);
      this.cleanup();
      process.exit(1);
    });
  }

  cleanup() {
    if (this.serviceProcess) {
      console.log('🔄 Shutting down moderation service...');
      try {
        // First try graceful shutdown
        this.serviceProcess.kill('SIGTERM');
        
        // If process doesn't exit in 5 seconds, force kill
        setTimeout(() => {
          if (this.serviceProcess && !this.serviceProcess.killed) {
            console.log('⚡ Force killing moderation service...');
            this.serviceProcess.kill('SIGKILL');
          }
        }, 5000);
        
        this.serviceProcess = null;
        console.log('✅ Moderation service shutdown complete');
      } catch (error) {
        console.error('❌ Error during cleanup:', error.message);
      }
    }
  }

  async startPersistentService() {
    try {
      const serverPath = path.join(__dirname, '../../automod/moderation_server.py');
      
      this.serviceProcess = spawn(this.pythonPath, [serverPath], {
        env: {
          ...process.env,
          MODERATION_SERVICE_PORT: this.servicePort,
          MODERATION_IDLE_TIMEOUT: '30' // 30 minutes idle timeout
        }
      });

      // Only log errors and completion status
      this.serviceProcess.stderr.on('data', (data) => {
        const output = data.toString().trim();
        // Only log actual errors, not warnings
        if (output.includes('ERROR') || output.includes('CRITICAL')) {
          console.error(`[ModerationService] ${output}`);
        }
      });

      this.serviceProcess.on('close', (code) => {
        if (code !== 0 && process.env.NODE_ENV !== 'test') {
          console.log(`⚠️ Moderation service exited with code ${code}`);
        }
        this.serviceProcess = null;
      });

      // Wait for service to start
      const isHealthy = await this.waitForServiceHealth(30000);
      
      if (isHealthy) {
        if (process.env.NODE_ENV !== 'test') {
          console.log('✅ Content moderation service ready');
        }
      } else {
        if (process.env.NODE_ENV !== 'test') {
          console.log('⚠️ Content moderation service failed to start, falling back to CLI');
        }
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
      
      // Silently wait and retry
      await new Promise(resolve => setTimeout(resolve, checkInterval));
    }
    
    return false;
  }

  async moderateContentViaPersistentService(contentData) {
    try {
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
      return result;
    } catch (error) {
      // Fallback to CLI method silently
      return this.moderateContentViaCLI(contentData);
    }
  }

  async moderateContentViaCLI(contentData) {
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
          resolve({ allowed: true, reason: 'Moderation service unavailable' });
        } else {
          try {
            const moderationResult = JSON.parse(result);
            resolve(moderationResult);
          } catch (e) {
            resolve({ allowed: true, reason: 'Moderation parsing error' });
          }
        }
      });
    });
  }

  async moderateContent(contentData) {
    if (!this.moderationEnabled) {
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
      try {
        const contentData = {
          title: req.body.title,
          content: req.body.content,
          author: req.body.author
        };

        const moderationResult = await this.moderateContent(contentData);

        if (!moderationResult.allowed) {
          // Create user-friendly error message
          const userMessage = this.createUserFriendlyMessage(moderationResult);
          
          return res.status(400).json({
            success: false,
            message: userMessage,
            code: 'CONTENT_MODERATED',
            timestamp: new Date().toISOString()
          });
        }

        // Add moderation results to request for logging
        req.moderationResult = moderationResult;
        next();
      } catch (error) {
        // In case of error, allow content but log the issue
        console.error('Moderation error:', error.message);
        next();
      }
    };
  }
}

module.exports = new ForumModerator();
