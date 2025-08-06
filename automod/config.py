#!/usr/bin/env python3
"""
Production configuration for auto-moderation service
"""
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


class ModerationConfig:
    """Configuration class for moderation service"""

    # Model configuration
    MODEL_NAME = os.getenv("MODEL", "irlab-udc/MetaHateBERT")
    HATE_THRESHOLD = float(os.getenv("HATE_THRESHOLD", "0.7"))

    # Service configuration
    ENABLE_MODERATION = os.getenv("ENABLE_MODERATION", "true").lower() == "true"
    SERVICE_PORT = int(os.getenv("MODERATION_SERVICE_PORT", "8001"))
    IDLE_TIMEOUT = int(os.getenv("MODERATION_IDLE_TIMEOUT", "30"))  # minutes

    # Logging configuration
    LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()
    LOG_FILE = os.getenv("LOG_FILE", "moderation.log")

    # Performance configuration
    MAX_TEXT_LENGTH = int(os.getenv("MAX_TEXT_LENGTH", "2048"))
    REQUEST_TIMEOUT = int(os.getenv("REQUEST_TIMEOUT", "10"))  # seconds

    # Security configuration
    ALLOWED_HOSTS = os.getenv("ALLOWED_HOSTS", "localhost,127.0.0.1").split(",")

    @classmethod
    def validate(cls):
        """Validate configuration values"""
        errors = []

        if not 0.0 <= cls.HATE_THRESHOLD <= 1.0:
            errors.append("HATE_THRESHOLD must be between 0.0 and 1.0")

        if cls.SERVICE_PORT < 1024 or cls.SERVICE_PORT > 65535:
            errors.append("SERVICE_PORT must be between 1024 and 65535")

        if cls.IDLE_TIMEOUT < 1:
            errors.append("IDLE_TIMEOUT must be at least 1 minute")

        return errors

    @classmethod
    def get_summary(cls):
        """Get configuration summary for logging"""
        return {
            "model": cls.MODEL_NAME,
            "threshold": cls.HATE_THRESHOLD,
            "enabled": cls.ENABLE_MODERATION,
            "port": cls.SERVICE_PORT,
            "timeout": cls.IDLE_TIMEOUT,
            "log_level": cls.LOG_LEVEL,
        }
