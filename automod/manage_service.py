#!/usr/bin/env python3
"""
Startup script for the persistent moderation service
"""
import subprocess
import sys
import os
import time
import requests
from pathlib import Path


def check_service_health(port=8001):
    """Check if the moderation service is running"""
    try:
        response = requests.get(f"http://localhost:{port}/health", timeout=5)
        return response.status_code == 200
    except:
        return False


def start_service(port=8001):
    """Start the persistent moderation service"""
    print("🚀 Starting persistent moderation service...")

    # Get the path to the moderation server
    script_dir = Path(__file__).parent
    server_script = script_dir / "moderation_server.py"

    if not server_script.exists():
        print("❌ moderation_server.py not found!")
        return False

    # Start the service
    env = os.environ.copy()
    env["MODERATION_SERVICE_PORT"] = str(port)
    env["MODERATION_IDLE_TIMEOUT"] = "30"

    process = subprocess.Popen(
        [sys.executable, str(server_script)],
        env=env,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
    )

    # Wait for service to start
    print("⏳ Waiting for service to start...")
    for i in range(30):  # Wait up to 30 seconds
        time.sleep(1)
        if check_service_health(port):
            print(f"✅ Moderation service is running on port {port}")
            print(f"📡 Health check: http://localhost:{port}/health")
            return True
        if i % 5 == 0:
            print(f"⏳ Still waiting... ({i+1}/30)")

    print("❌ Service failed to start within 30 seconds")
    return False


def stop_service(port=8001):
    """Stop the persistent moderation service"""
    try:
        # For Windows, use taskkill to stop the process
        if os.name == "nt":
            subprocess.run(["taskkill", "/f", "/im", "python.exe"], capture_output=True)
        else:
            # For Unix-like systems, you might need to implement PID tracking
            subprocess.run(["pkill", "-f", "moderation_server.py"], capture_output=True)
        print("🛑 Moderation service stopped")
    except Exception as e:
        print(f"❌ Error stopping service: {e}")


def main():
    import argparse

    parser = argparse.ArgumentParser(description="Manage persistent moderation service")
    parser.add_argument(
        "action",
        choices=["start", "stop", "restart", "status"],
        help="Action to perform",
    )
    parser.add_argument(
        "--port", type=int, default=8001, help="Port for the service (default: 8001)"
    )

    args = parser.parse_args()

    if args.action == "start":
        if check_service_health(args.port):
            print(f"✅ Service is already running on port {args.port}")
        else:
            start_service(args.port)

    elif args.action == "stop":
        stop_service(args.port)

    elif args.action == "restart":
        stop_service(args.port)
        time.sleep(2)
        start_service(args.port)

    elif args.action == "status":
        if check_service_health(args.port):
            print(f"✅ Service is running on port {args.port}")
            try:
                response = requests.get(f"http://localhost:{args.port}/health")
                health_data = response.json()
                print(f"📊 Status: {health_data.get('status', 'unknown')}")
                print(f"🧠 Model loaded: {health_data.get('model_loaded', 'unknown')}")
                print(f"⏰ Uptime: {health_data.get('uptime', 'unknown')}")
            except:
                print("📊 Service responding but health data unavailable")
        else:
            print(f"❌ Service is not running on port {args.port}")


if __name__ == "__main__":
    main()
