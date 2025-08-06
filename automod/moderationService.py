# Auto-Moderation Service for Forum Content
import os
import sys
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
import torch.nn.functional as F
from dotenv import load_dotenv
import logging

# Load environment variables
load_dotenv()


class ContentModerator:
    def __init__(self):
        self.model_name = os.getenv("MODEL", "irlab-udc/MetaHateBERT")
        self.confidence_threshold = float(os.getenv("HATE_THRESHOLD", "0.7"))
        self.tokenizer = None
        self.model = None
        self.logger = self._setup_logger()

    def _setup_logger(self):
        logging.basicConfig(level=logging.INFO)
        return logging.getLogger(__name__)

    def load_model(self):
        """Load the hate speech detection model"""
        try:
            self.logger.info(f"Loading model: {self.model_name}")
            self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
            self.model = AutoModelForSequenceClassification.from_pretrained(
                self.model_name
            )
            self.logger.info("Model loaded successfully")
            return True
        except Exception as e:
            self.logger.error(f"Failed to load model: {e}")
            return False

    def predict_hate_speech(self, text):
        """
        Predict hate speech for given text
        Returns: dict with prediction results
        """
        if not self.model or not self.tokenizer:
            raise ValueError("Model not loaded. Call load_model() first.")

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

            return {
                "text": text,
                "label": label,
                "confidence": confidence,
                "is_hate": label == "HATE",
                "should_block": label == "HATE"
                and confidence >= self.confidence_threshold,
            }

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
        results = {
            "allowed": True,
            "blocked_reason": None,
            "predictions": {},
            "overall_confidence": 0.0,
        }

        # Check title if present
        if content_data.get("title"):
            title_result = self.predict_hate_speech(content_data["title"])
            results["predictions"]["title"] = title_result

            if title_result["should_block"]:
                results["allowed"] = False
                results["blocked_reason"] = (
                    f"Inappropriate title detected (confidence: {title_result['confidence']:.2f})"
                )
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
                return results

        # Calculate overall confidence
        confidences = [pred["confidence"] for pred in results["predictions"].values()]
        if confidences:
            results["overall_confidence"] = max(confidences)

        return results


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
