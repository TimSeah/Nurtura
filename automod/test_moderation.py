#!/usr/bin/env python3
"""
Test script for the auto-moderation system
"""
import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__)))

from moderationService import ContentModerator, initialize_moderation_service


def test_moderation():
    print("🧪 Testing Auto-Moderation System")
    print("=" * 50)

    # Initialize moderation service
    print("Loading model...")
    if not initialize_moderation_service():
        print("❌ Failed to load model")
        return
    print("✅ Model loaded successfully")

    # Test cases
    test_cases = [
        {
            "title": "Welcome to our community!",
            "content": "This is a safe space for everyone to share their thoughts.",
            "author": "friendly_user",
        },
        {
            "title": "I hate everyone here",
            "content": "You are all stupid idiots and should go kill yourselves",
            "author": "toxic_user",
        },
        {
            "title": "Help with medication",
            "content": "Can someone help me understand my medication schedule?",
            "author": "care_recipient",
        },
        {
            "title": "Inappropriate post",
            "content": "This contains hate speech and inappropriate language targeting minorities",
            "author": "bad_actor",
        },
    ]

    moderator = ContentModerator()
    moderator.load_model()

    for i, test_case in enumerate(test_cases, 1):
        print(f"\n🔍 Test Case {i}:")
        print(f"Title: {test_case['title']}")
        print(f"Content: {test_case['content'][:50]}...")

        result = moderator.moderate_content(test_case)

        if result["allowed"]:
            print("✅ ALLOWED")
        else:
            print("❌ BLOCKED")
            print(f"Reason: {result['blocked_reason']}")

        print(f"Overall confidence: {result['overall_confidence']:.3f}")
        print("-" * 30)


if __name__ == "__main__":
    test_moderation()
