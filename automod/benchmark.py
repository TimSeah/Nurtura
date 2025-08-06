#!/usr/bin/env python3
"""
Performance benchmark comparing CLI vs Persistent Service moderation
"""
import time
import json
import requests
import subprocess
import statistics
from datetime import datetime


def benchmark_cli_moderation(content_data, num_tests=5):
    """Benchmark the CLI moderation method"""
    print(f"Benchmarking CLI moderation ({num_tests} tests)...")
    times = []

    for i in range(num_tests):
        start_time = time.time()

        # Call the CLI script
        process = subprocess.Popen(
            ["C:/Users/user/anaconda3/python.exe", "moderate_cli.py"],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
        )

        stdout, stderr = process.communicate(json.dumps(content_data))

        end_time = time.time()
        elapsed = end_time - start_time
        times.append(elapsed)

        print(f"  Test {i+1}: {elapsed:.3f}s")

    return times


def benchmark_persistent_service(content_data, num_tests=5):
    """Benchmark the persistent service method"""
    print(f"Benchmarking Persistent Service ({num_tests} tests)...")
    times = []

    # Check if service is running
    try:
        health_response = requests.get("http://localhost:8001/health", timeout=5)
        if health_response.status_code != 200:
            print("Persistent service is not running!")
            return []
    except:
        print("Persistent service is not available!")
        return []

    for i in range(num_tests):
        start_time = time.time()

        # Call the persistent service
        response = requests.post(
            "http://localhost:8001/", json=content_data, timeout=10
        )

        end_time = time.time()
        elapsed = end_time - start_time
        times.append(elapsed)

        print(f"  Test {i+1}: {elapsed:.3f}s")

        # Small delay between requests
        time.sleep(0.1)

    return times


def main():
    print("🚀 Auto-Moderation Performance Benchmark")
    print("=" * 50)
    print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()

    # Test content
    test_content = {
        "title": "Test Post",
        "content": "This is a test message for performance benchmarking",
        "author": "BenchmarkUser",
    }

    print("Test Content:")
    print(f"  Title: {test_content['title']}")
    print(f"  Content: {test_content['content']}")
    print()

    # Benchmark CLI method
    cli_times = benchmark_cli_moderation(test_content, num_tests=3)
    print()

    # Benchmark persistent service
    persistent_times = benchmark_persistent_service(test_content, num_tests=5)
    print()

    # Results
    print("📊 BENCHMARK RESULTS")
    print("=" * 50)

    if cli_times:
        cli_avg = statistics.mean(cli_times)
        cli_min = min(cli_times)
        cli_max = max(cli_times)
        print(f"CLI Method:")
        print(f"  Average: {cli_avg:.3f}s")
        print(f"  Min:     {cli_min:.3f}s")
        print(f"  Max:     {cli_max:.3f}s")
    else:
        print("CLI Method: No data")

    print()

    if persistent_times:
        persistent_avg = statistics.mean(persistent_times)
        persistent_min = min(persistent_times)
        persistent_max = max(persistent_times)
        print(f"Persistent Service:")
        print(f"  Average: {persistent_avg:.3f}s")
        print(f"  Min:     {persistent_min:.3f}s")
        print(f"  Max:     {persistent_max:.3f}s")

        if cli_times:
            speedup = cli_avg / persistent_avg
            print()
            print(f"🚀 PERFORMANCE IMPROVEMENT:")
            print(f"  Speedup: {speedup:.1f}x faster")
            print(f"  Time Saved: {(cli_avg - persistent_avg):.3f}s per request")
            print(
                f"  % Improvement: {((cli_avg - persistent_avg) / cli_avg * 100):.1f}%"
            )
    else:
        print("Persistent Service: No data")

    print()
    print("💡 Note: The persistent service keeps the AI model loaded in memory,")
    print("   eliminating the ~2-3 second model loading time for each request.")


if __name__ == "__main__":
    main()
