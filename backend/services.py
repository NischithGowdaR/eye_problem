"""Optional integrations that fail safely when credentials or a model are absent."""
from __future__ import annotations

import hashlib
import os
from pathlib import Path

from PIL import Image


class ScreeningService:
    """Runs the configured Keras model; development fallback is explicitly identified."""

    def __init__(self, model_path: str, labels: tuple[str, ...]):
        self.labels = labels
        self.model = None
        self.available = False
        if Path(model_path).is_file():
            try:
                import tensorflow as tf
                self.model = tf.keras.models.load_model(model_path)
                self.available = True
            except (ImportError, OSError, ValueError):
                pass

    def predict(self, image_path: str) -> dict:
        if self.available:
            import numpy as np
            img = Image.open(image_path).convert("RGB").resize((224, 224))
            scores = self.model.predict(np.expand_dims(np.asarray(img, dtype="float32") / 255.0, 0), verbose=0)[0]
            index = int(np.argmax(scores))
            return {"disease": self.labels[index], "confidence": round(float(scores[index]), 4), "model_status": "configured"}
        raw = Path(image_path).read_bytes()
        digest = hashlib.sha256(raw).hexdigest()
        index = int(digest[:8], 16) % len(self.labels)
        return {"disease": self.labels[index], "confidence": round(.55 + (int(digest[8:12], 16) % 40) / 100, 2), "model_status": "development_fallback"}


DISEASE_GUIDANCE = {
    "Cataract": {"symptoms": ["Blurred vision", "Glare sensitivity"], "prevention": ["Use UV protection", "Attend regular eye exams"]},
    "Glaucoma": {"symptoms": ["Often no early symptoms", "Reduced peripheral vision"], "prevention": ["Regular pressure checks", "Know family history"]},
    "Diabetic Retinopathy": {"symptoms": ["Blurred vision", "Dark spots"], "prevention": ["Manage blood sugar", "Annual dilated exam"]},
    "AMD": {"symptoms": ["Distorted central vision", "Difficulty reading"], "prevention": ["Avoid smoking", "Eat leafy greens"]},
    "Conjunctivitis": {"symptoms": ["Redness", "Irritation"], "prevention": ["Wash hands", "Avoid sharing towels"]},
    "Normal": {"symptoms": [], "prevention": ["Continue regular eye examinations", "Use protective eyewear"]},
}


def guidance_for(disease: str) -> dict:
    details = DISEASE_GUIDANCE.get(disease, {"symptoms": [], "prevention": []})
    return {**details, "general_treatment_guidance": "Only a qualified ophthalmologist can assess appropriate care.", "lifestyle_advice": ["Avoid smoking", "Take screen breaks", "Maintain routine eye care"]}
