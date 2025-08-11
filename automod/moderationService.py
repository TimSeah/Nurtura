# Auto-Moderation Service for Forum Content
import os
import sys
import json
import logging
from pathlib import Path
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
import torch.nn.functional as F
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


class ContentModerator:
    def __init__(self):
        self.model_name = os.getenv("MODEL", "irlab-udc/MetaHateBERT")
        self.confidence_threshold = float(os.getenv("HATE_THRESHOLD", "0.7"))
        self.tokenizer = None
        self.model = None
        self.logger = self._setup_logger()
        self.model_loaded = False

    def _setup_logger(self):
        """Setup logging for production use"""
        log_level = os.getenv("LOG_LEVEL", "WARNING").upper()  # Changed default to WARNING
        
        # Only log to file in production, reduce console noise
        handlers = []
        if os.getenv("NODE_ENV") == "development":
            handlers.append(logging.StreamHandler(sys.stdout))
        
        # Always log errors to file
        handlers.append(logging.FileHandler("/tmp/moderation.log", mode="a"))
        
        logging.basicConfig(
            level=getattr(logging, log_level, logging.WARNING),
            format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
            handlers=handlers,
        )
        return logging.getLogger(__name__)

    def load_model(self):
        """Load the hate speech detection model"""
        try:
            self.logger.info(f"Loading model: {self.model_name}")
            self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
            self.model = AutoModelForSequenceClassification.from_pretrained(
                self.model_name
            )
            self.model_loaded = True
            self.logger.info("Model loaded successfully")
            return True
        except Exception as e:
            self.logger.error(f"Failed to load model: {e}")
            self.model_loaded = False
            return False

    def is_ready(self):
        """Check if the moderation service is ready"""
        return (
            self.model_loaded and self.model is not None and self.tokenizer is not None
        )

    def predict_hate_speech(self, text):
        """
        Predict hate speech for given text
        Returns: dict with prediction results
        """
        if not self.is_ready():
            self.logger.warning("Model not ready. Call load_model() first.")
            return {
                "text": text,
                "label": "ERROR",
                "confidence": 0.0,
                "is_hate": False,
                "should_block": False,
                "error": "Model not loaded",
            }

        # Input validation and sanitization
        if not isinstance(text, str):
            text = str(text)

        text = text.strip()
        if not text:
            return {
                "text": text,
                "label": "NOT_HATE",
                "confidence": 0.0,
                "is_hate": False,
                "should_block": False,
            }

        # Truncate very long text
        max_length = 512
        if len(text) > max_length * 4:  # Rough estimate for tokenization
            text = text[: max_length * 4]

        try:
            # Tokenize input
            inputs = self.tokenizer(
                text, return_tensors="pt", truncation=True, padding=True, max_length=512
            )

            # Get model predictions
            with torch.no_grad():
                outputs = self.model(**inputs)
                predictions = F.softmax(outputs.logits, dim=-1)

            # Get predicted class and confidence
            predicted_class = torch.argmax(predictions, dim=-1).item()
            confidence = predictions[0][predicted_class].item()

            # Map class to label (MetaHateBERT specific)
            label_map = {0: "NOT_HATE", 1: "HATE"}
            label = label_map.get(predicted_class, f"CLASS_{predicted_class}")

            result = {
                "text": text,
                "label": label,
                "confidence": confidence,
                "is_hate": label == "HATE",
                "should_block": label == "HATE"
                and confidence >= self.confidence_threshold,
            }

            # Log high-confidence detections (only in debug mode)
            if result["should_block"]:
                self.logger.debug(
                    f"Blocking content - Label: {label}, Confidence: {confidence:.3f}"
                )

            return result

        except Exception as e:
            self.logger.error(f"Error during prediction: {e}")
            return {
                "text": text,
                "label": "ERROR",
                "confidence": 0.0,
                "is_hate": False,
                "should_block": False,
                "error": str(e),
            }

    def moderate_content(self, content_data):
        """
        Moderate forum content (posts/comments)
        Args:
            content_data: dict with 'title', 'content', 'author' etc.
        Returns:
            dict with moderation results
        """
        if not isinstance(content_data, dict):
            self.logger.error("Invalid content_data: must be a dictionary")
            return {
                "allowed": True,  # Fail-safe: allow on error
                "blocked_reason": None,
                "predictions": {},
                "overall_confidence": 0.0,
                "error": "Invalid input format",
            }

        results = {
            "allowed": True,
            "blocked_reason": None,
            "predictions": {},
            "overall_confidence": 0.0,
            "timestamp": self._get_timestamp(),
        }

        try:
            # Check title if present
            if content_data.get("title"):
                title_result = self.predict_hate_speech(content_data["title"])
                results["predictions"]["title"] = title_result

                if title_result["should_block"]:
                    results["allowed"] = False
                    results["blocked_reason"] = (
                        f"Inappropriate title detected (confidence: {title_result['confidence']:.2f})"
                    )
                    self.logger.debug(f"Blocked content - Title moderation")
                    return results

            # Check content
            if content_data.get("content"):
                content_result = self.predict_hate_speech(content_data["content"])
                results["predictions"]["content"] = content_result

                if content_result["should_block"]:
                    results["allowed"] = False
                    results["blocked_reason"] = (
                        f"Inappropriate content detected (confidence: {content_result['confidence']:.2f})"
                    )
                    self.logger.debug(f"Blocked content - Content moderation")
                    return results

            # Calculate overall confidence
            confidences = [
                pred.get("confidence", 0.0)
                for pred in results["predictions"].values()
                if isinstance(pred, dict)
            ]
            if confidences:
                results["overall_confidence"] = max(confidences)

            # Log successful moderation
            self.logger.debug(
                f"Content allowed - Max confidence: {results['overall_confidence']:.3f}"
            )
            return results

        except Exception as e:
            self.logger.error(f"Error during content moderation: {e}")
            # Fail-safe: allow content on error
            return {
                "allowed": True,
                "blocked_reason": None,
                "predictions": {},
                "overall_confidence": 0.0,
                "error": str(e),
                "timestamp": self._get_timestamp(),
            }

    def _get_timestamp(self):
        """Get current timestamp for logging"""
        from datetime import datetime

        return datetime.now().isoformat()


# Initialize global moderator instance
moderator = ContentModerator()


def initialize_moderation_service():
    """Initialize the moderation service - call this on server startup"""
    return moderator.load_model()


def moderate_forum_content(content_data):
    """
    Main function to moderate forum content
    Usage in your forum routes
    """
    return moderator.moderate_content(content_data)
