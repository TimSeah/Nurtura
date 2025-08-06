#!/usr/bin/env python3
"""
Standalone moderation script for Node.js integration
Reads content from stdin, performs moderation, outputs result to stdout
"""
import sys
import json
import os
from pathlib import Path

# Add the automod directory to Python path
sys.path.append(str(Path(__file__).parent))

from moderationService import moderate_forum_content, initialize_moderation_service


def main():
    try:
        # Initialize the moderation service
        if not initialize_moderation_service():
            print(
                json.dumps(
                    {"allowed": True, "reason": "Failed to load moderation model"}
                )
            )
            sys.exit(0)

        # Read content data from stdin
        input_data = sys.stdin.read()
        content_data = json.loads(input_data)

        # Perform moderation
        result = moderate_forum_content(content_data)

        # Output result as JSON
        print(json.dumps(result))

    except Exception as e:
        # In case of any error, default to allowing content
        error_result = {"allowed": True, "reason": f"Moderation error: {str(e)}"}
        print(json.dumps(error_result))
        sys.exit(0)


if __name__ == "__main__":
    main()
