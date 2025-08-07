#!/usr/bin/env python3
"""
Persistent moderation service that keeps the model loaded in memory
Runs as a background service to provide fast moderation responses
"""
import sys
import os
import json
import time
import signal
import threading
from datetime import datetime, timedelta
from http.server import HTTPServer, BaseHTTPRequestHandler
import urllib.parse

# Add current directory to path
sys.path.append(os.path.dirname(__file__))

from moderationService import ContentModerator, initialize_moderation_service

# Global variables for graceful shutdown
server_instance = None
shutdown_requested = False


class ModerationHandler(BaseHTTPRequestHandler):
    def __init__(self, *args, moderator=None, **kwargs):
        self.moderator = moderator
        super().__init__(*args, **kwargs)

    def do_POST(self):
        """Handle POST requests for moderation"""
        try:
            # Parse content length
            content_length = int(self.headers["Content-Length"])
            post_data = self.rfile.read(content_length)

            # Parse JSON data
            data = json.loads(post_data.decode("utf-8"))

            # Update last used time
            self.moderator.last_used = datetime.now()

            # Moderate content
            result = self.moderator.moderate_content(data)

            # Send response
            self.send_response(200)
            self.send_header("Content-type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(result).encode("utf-8"))

        except Exception as e:
            # Send error response
            self.send_response(500)
            self.send_header("Content-type", "application/json")
            self.end_headers()
            error_response = {
                "allowed": True,  # Default to allowing on error
                "error": str(e),
                "reason": "Moderation service error",
            }
            self.wfile.write(json.dumps(error_response).encode("utf-8"))

    def do_GET(self):
        """Handle GET requests for health checks"""
        if self.path == "/health":
            self.send_response(200)
            self.send_header("Content-type", "application/json")
            self.end_headers()
            health_data = {
                "status": "healthy",
                "model_loaded": self.moderator.model is not None,
                "last_used": (
                    self.moderator.last_used.isoformat()
                    if self.moderator.last_used
                    else None
                ),
                "uptime": str(datetime.now() - self.moderator.start_time),
            }
            self.wfile.write(json.dumps(health_data).encode("utf-8"))
        else:
            self.send_response(404)
            self.end_headers()

    def log_message(self, format, *args):
        """Override to provide custom logging"""
        print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] {format % args}")


class PersistentModerator(ContentModerator):
    def __init__(self, idle_timeout_minutes=30):
        super().__init__()
        self.start_time = datetime.now()
        self.last_used = None
        self.idle_timeout = timedelta(minutes=idle_timeout_minutes)
        self.model_loaded = False
        self.shutdown_timer = None

    def load_model(self):
        """Load the model and mark as loaded"""
        print(f"Loading moderation model at {datetime.now().strftime('%H:%M:%S')}...")
        super().load_model()
        self.model_loaded = True
        self.last_used = datetime.now()
        print(
            f"Model loaded successfully in {(datetime.now() - self.start_time).total_seconds():.2f}s"
        )

    def moderate_content(self, content_data):
        """Override to track usage and reset idle timer"""
        self.last_used = datetime.now()

        # Reset shutdown timer
        if self.shutdown_timer:
            self.shutdown_timer.cancel()

        # Schedule shutdown check
        self.schedule_idle_check()

        return super().moderate_content(content_data)

    def schedule_idle_check(self):
        """Schedule a check to see if we should shutdown due to inactivity"""

        def check_idle():
            if self.last_used and datetime.now() - self.last_used > self.idle_timeout:
                print(
                    f"Model idle for {self.idle_timeout.total_seconds()/60:.0f} minutes, shutting down..."
                )
                os._exit(0)  # Graceful shutdown
            else:
                # Schedule next check in 5 minutes
                self.shutdown_timer = threading.Timer(300, check_idle)  # 5 minutes
                self.shutdown_timer.start()

        self.shutdown_timer = threading.Timer(
            self.idle_timeout.total_seconds(), check_idle
        )
        self.shutdown_timer.start()


def create_handler(moderator):
    """Create a handler class with the moderator instance"""

    def handler(*args, **kwargs):
        return ModerationHandler(*args, moderator=moderator, **kwargs)

    return handler


def signal_handler(signum, frame):
    """Handle shutdown signals gracefully"""
    global server_instance, shutdown_requested
    print(f"\nReceived signal {signum}, shutting down moderation service...")
    shutdown_requested = True
    if server_instance:
        server_instance.shutdown()

def main():
    global server_instance
    
    # Setup signal handlers for graceful shutdown
    signal.signal(signal.SIGTERM, signal_handler)
    signal.signal(signal.SIGINT, signal_handler)
    
    # Configuration
    PORT = int(os.getenv("MODERATION_SERVICE_PORT", 8001))
    IDLE_TIMEOUT = int(os.getenv("MODERATION_IDLE_TIMEOUT", 30))  # minutes

    print("Starting Persistent Moderation Service")
    print(f"Port: {PORT}")
    print(f"Idle timeout: {IDLE_TIMEOUT} minutes")
    print("-" * 50)

    # Initialize moderation service
    if not initialize_moderation_service():
        print("Failed to initialize moderation service")
        sys.exit(1)

    # Create persistent moderator
    moderator = PersistentModerator(idle_timeout_minutes=IDLE_TIMEOUT)
    moderator.load_model()

    # Start HTTP server
    handler = create_handler(moderator)
    host = os.getenv("API_HOST", "0.0.0.0")  # Bind to all interfaces for Docker
    server_instance = HTTPServer((host, PORT), handler)

    print(f"Moderation service running on http://{host}:{PORT}")
    print(f"Health check: http://{host}:{PORT}/health")
    print(f"POST moderation requests to http://{host}:{PORT}/")
    print("-" * 50)

    try:
        server_instance.serve_forever()
    except KeyboardInterrupt:
        print("\nKeyboard interrupt received...")
    except Exception as e:
        print(f"Server error: {e}")
    finally:
        print("Shutting down moderation service...")
        if server_instance:
            server_instance.server_close()
        print("Moderation service stopped.")
        sys.exit(0)


if __name__ == "__main__":
    main()
