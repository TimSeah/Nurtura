# Load model directly for more control - LOCAL INFERENCE
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
import torch.nn.functional as F
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
MODEL = os.getenv("MODEL", "irlab-udc/MetaHateBERT")

print("Loading tokenizer and model...")
tokenizer = AutoTokenizer.from_pretrained(MODEL)
model = AutoModelForSequenceClassification.from_pretrained(MODEL)


def predict_hate_speech(text):
    """
    Predict hate speech for a given text
    Returns: (label, confidence_score)
    """
    # Tokenize input
    inputs = tokenizer(
        text, return_tensors="pt", truncation=True, padding=True, max_length=512
    )

    # Get model predictions
    with torch.no_grad():
        outputs = model(**inputs)
        predictions = F.softmax(outputs.logits, dim=-1)

    # Get predicted class and confidence
    predicted_class = torch.argmax(predictions, dim=-1).item()
    confidence = predictions[0][predicted_class].item()

    # Map class to label (check model config for actual mapping)
    label_map = {0: "NOT_HATE", 1: "HATE"}  # This might need adjustment based on model
    label = label_map.get(predicted_class, f"CLASS_{predicted_class}")

    return label, confidence


# Test the function
test_texts = [
    "I hate all immigrants",
    "This is a beautiful day",
    "You stupid idiot, go kill yourself",
    "Machine learning is fascinating",
]

print("\nManual inference results:")
print("=" * 60)

for text in test_texts:
    label, confidence = predict_hate_speech(text)
    print(f"Text: {text}")
    print(f"  Prediction: {label} (confidence: {confidence:.4f})")
    print("-" * 60)
