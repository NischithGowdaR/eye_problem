import json
from pathlib import Path
from typing import Any, Tuple

import numpy as np
from PIL import Image, ImageOps


CLASS_NAMES = [
    "cataract",
    "glaucoma",
    "diabetic_retinopathy",
    "amd",
    "conjunctivitis",
    "normal",
]

IMAGE_SIZE = (224, 224)
MODEL_PATH = Path(__file__).resolve().parent / "trained_eye_model.keras"
LABELS_PATH = Path(__file__).resolve().parent / "labels.json"


try:
    import tensorflow as tf
    from tensorflow import keras
except Exception as exc:  # pragma: no cover - runtime dependency check
    tf = None
    keras = None
    _TF_IMPORT_ERROR = exc
else:
    _TF_IMPORT_ERROR = None


def build_model() -> Any:
    """Create a compact CNN for eye disease classification."""
    model = keras.Sequential(
        [
            keras.layers.Input(shape=(IMAGE_SIZE[0], IMAGE_SIZE[1], 3)),
            keras.layers.Rescaling(1.0 / 255.0),
            keras.layers.Conv2D(32, 3, activation="relu"),
            keras.layers.MaxPooling2D(),
            keras.layers.Conv2D(64, 3, activation="relu"),
            keras.layers.MaxPooling2D(),
            keras.layers.Conv2D(128, 3, activation="relu"),
            keras.layers.MaxPooling2D(),
            keras.layers.Flatten(),
            keras.layers.Dense(128, activation="relu"),
            keras.layers.Dropout(0.3),
            keras.layers.Dense(len(CLASS_NAMES), activation="softmax"),
        ]
    )

    model.compile(
        optimizer="adam",
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"],
    )
    return model


def _make_synthetic_sample(class_name: str, rng: np.random.Generator) -> np.ndarray:
    """Create a simple synthetic eye-style image to make the model runnable without a dataset."""
    image = np.zeros((IMAGE_SIZE[0], IMAGE_SIZE[1], 3), dtype=np.float32)

    # Base background tone
    image[:, :, 0] = 0.15 + 0.08 * rng.random((IMAGE_SIZE[0], IMAGE_SIZE[1]))
    image[:, :, 1] = 0.12 + 0.06 * rng.random((IMAGE_SIZE[0], IMAGE_SIZE[1]))
    image[:, :, 2] = 0.10 + 0.05 * rng.random((IMAGE_SIZE[0], IMAGE_SIZE[1]))

    center = (IMAGE_SIZE[0] // 2, IMAGE_SIZE[1] // 2)
    radius = 70

    # Draw a circular iris-like region
    yy, xx = np.ogrid[:IMAGE_SIZE[0], :IMAGE_SIZE[1]]
    mask = (xx - center[1]) ** 2 + (yy - center[0]) ** 2 <= radius**2
    image[mask] = [0.2, 0.25, 0.3]

    # Class-specific pattern
    if class_name == "cataract":
        image[..., 0] += 0.25
        image[..., 1] += 0.15
        image[..., 2] += 0.1
        image[center[0] - 20:center[0] + 20, center[1] - 20:center[1] + 20] += 0.2
    elif class_name == "glaucoma":
        image[..., 0] += 0.08
        image[..., 2] += 0.18
        image[mask] = [0.25, 0.12, 0.18]
    elif class_name == "diabetic_retinopathy":
        image[..., 0] += 0.06
        image[..., 1] += 0.1
        image[..., 2] += 0.2
        spots = rng.random((20, 20)) > 0.7
        image[center[0] - 10:center[0] + 10, center[1] - 10:center[1] + 10][spots] = [0.1, 0.08, 0.05]
    elif class_name == "amd":
        image[..., 0] += 0.15
        image[..., 1] += 0.18
        image[..., 2] += 0.05
        image[center[0] - 15:center[0] + 15, center[1] - 15:center[1] + 15] = [0.12, 0.10, 0.08]
    elif class_name == "conjunctivitis":
        image[..., 0] += 0.22
        image[..., 1] += 0.06
        image[..., 2] += 0.06
        image[center[0] - 30:center[0] + 30, center[1] - 30:center[1] + 30] += 0.15
    else:
        image[..., 0] += 0.04
        image[..., 1] += 0.08
        image[..., 2] += 0.05

    image += rng.normal(0, 0.02, size=image.shape)
    image = np.clip(image, 0.0, 1.0)
    return image


def generate_dataset(samples_per_class: int = 120) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    """Create a small synthetic dataset for a baseline model."""
    rng = np.random.default_rng(42)
    features, labels = [], []

    for class_name in CLASS_NAMES:
        for _ in range(samples_per_class):
            features.append(_make_synthetic_sample(class_name, rng))
            labels.append(CLASS_NAMES.index(class_name))

    features = np.stack(features, axis=0)
    labels = np.array(labels, dtype=np.int32)

    indices = np.arange(len(labels))
    rng.shuffle(indices)
    features = features[indices]
    labels = labels[indices]

    split = int(0.8 * len(labels))
    train_x, test_x = features[:split], features[split:]
    train_y, test_y = labels[:split], labels[split:]
    return train_x, train_y, test_x, test_y


def train_and_save_model(epochs: int = 6, output_path: str | None = None) -> Tuple[Any, dict]:
    """Train the model and save weights and labels to disk."""
    if keras is None:
        raise RuntimeError("TensorFlow is required. Install it with pip install -r requirements.txt")

    model = build_model()
    train_x, train_y, test_x, test_y = generate_dataset()

    model.fit(train_x, train_y, epochs=epochs, validation_data=(test_x, test_y), verbose=1)
    loss, accuracy = model.evaluate(test_x, test_y, verbose=0)

    save_path = Path(output_path or MODEL_PATH)
    save_path.parent.mkdir(parents=True, exist_ok=True)
    model.save(save_path)

    with LABELS_PATH.open("w", encoding="utf-8") as fh:
        json.dump(CLASS_NAMES, fh)

    metrics = {"loss": float(loss), "accuracy": float(accuracy)}
    return model, metrics


def load_model_and_labels(model_path: str | None = None) -> Tuple[Any, list[str]]:
    """Load the saved model and class labels."""
    if keras is None:
        return None, CLASS_NAMES

    model_file = Path(model_path or MODEL_PATH)
    if not model_file.exists():
        train_and_save_model(output_path=str(model_file))

    model = keras.models.load_model(model_file)
    labels = json.loads(LABELS_PATH.read_text(encoding="utf-8")) if LABELS_PATH.exists() else CLASS_NAMES
    return model, labels


def preprocess_image(image_path: str) -> np.ndarray:
    """Load and preprocess an image for prediction."""
    image = Image.open(image_path).convert("RGB")
    image = ImageOps.fit(image, IMAGE_SIZE, method=Image.Resampling.LANCZOS)
    image_array = np.array(image, dtype=np.float32) / 255.0
    return np.expand_dims(image_array, axis=0)


def predict_image(image_path: str, model_path: str | None = None) -> dict:
    """Return predicted class and confidence for the given image."""
    if keras is None:
        return {
            "predicted_class": "normal",
            "confidence": 50.0,
            "probabilities": {label: 100.0 / len(CLASS_NAMES) for label in CLASS_NAMES},
            "note": "TensorFlow is not installed; this is a fallback response."
        }

    model, labels = load_model_and_labels(model_path)
    image_array = preprocess_image(image_path)
    probabilities = model.predict(image_array, verbose=0)[0]
    predicted_index = int(np.argmax(probabilities))
    predicted_class = labels[predicted_index]
    confidence = float(probabilities[predicted_index]) * 100.0

    return {
        "predicted_class": predicted_class,
        "confidence": round(confidence, 2),
        "probabilities": {label: round(float(probabilities[idx]) * 100.0, 2) for idx, label in enumerate(labels)},
    }
