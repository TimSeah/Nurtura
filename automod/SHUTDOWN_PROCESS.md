# Auto-Moderation Service Shutdown Process

## Overview
The auto-moderation system now has proper shutdown handling to ensure the Python model service stops when the webapp server shuts down.

## Shutdown Chain

### 1. Node.js Server Shutdown
When the Node.js server receives a shutdown signal (SIGINT, SIGTERM):

```javascript
// server.js
async function cleanup() {
  console.log('Server shutting down...');
  
  // Cleanup moderation service
  const moderator = require('./middleware/moderationMiddleware');
  moderator.cleanup();
  
  // Disconnect MongoDB
  if (mongoose.connection.readyState === 1) {
    await mongoose.disconnect();
  }
  
  process.exit(0);
}
```

### 2. Moderation Middleware Cleanup
The ForumModerator class handles Python process cleanup:

```javascript
cleanup() {
  if (this.serviceProcess) {
    console.log('🔄 Shutting down moderation service...');
    
    // Graceful shutdown first
    this.serviceProcess.kill('SIGTERM');
    
    // Force kill after 5 seconds if needed
    setTimeout(() => {
      if (this.serviceProcess && !this.serviceProcess.killed) {
        this.serviceProcess.kill('SIGKILL');
      }
    }, 5000);
  }
}
```

### 3. Python Service Signal Handling
The moderation_server.py handles shutdown signals:

```python
def signal_handler(signum, frame):
    print(f"Received signal {signum}, shutting down...")
    if server_instance:
        server_instance.shutdown()

# Setup signal handlers
signal.signal(signal.SIGTERM, signal_handler)
signal.signal(signal.SIGINT, signal_handler)
```

## Manual Service Management

### Stop Service Command
```bash
# Using manage_service.py
python manage_service.py stop

# Using batch file
manage_service.bat stop
```

### Process Identification
The system uses `psutil` to intelligently find and stop only the moderation service:

1. **Port-based**: Finds processes listening on port 8001
2. **Command-line based**: Finds Python processes running `moderation_server.py`
3. **Graceful termination**: Attempts SIGTERM first, then SIGKILL if needed

## Shutdown Triggers

The system responds to these shutdown events:

- **Ctrl+C** (SIGINT)
- **System shutdown** (SIGTERM)
- **Process kill** commands
- **Node.js server restart**
- **Application crash** (cleanup on uncaught exceptions)

## Testing Shutdown

### Test graceful shutdown:
```bash
# Start the server
npm start

# In another terminal, stop gracefully
Ctrl+C
```

### Test manual stop:
```bash
# Check if service is running
cd automod
python manage_service.py status

# Stop the service
python manage_service.py stop

# Verify it's stopped
python manage_service.py status
```

## Verification Commands

### Check for running moderation services:
```powershell
# Check port 8001
netstat -ano | findstr :8001

# Check Python processes
Get-Process python | Where-Object {$_.CommandLine -like "*moderation*"}
```

### Health check:
```powershell
Invoke-WebRequest -Uri "http://localhost:8001/health"
```

## Dependencies

- **psutil**: Added to requirements.txt for intelligent process management
- **signal**: Built-in Python module for handling shutdown signals
- **subprocess**: Node.js built-in for process spawning and management

## Result

✅ **Automatic shutdown**: Python model stops when Node.js server stops  
✅ **Graceful termination**: Services get time to clean up properly  
✅ **Force kill fallback**: Ensures processes don't become zombies  
✅ **Manual control**: Can start/stop services independently  
✅ **Process isolation**: Only targets moderation service, not all Python processes
