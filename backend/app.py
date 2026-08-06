import os
import sys
import tempfile
from pathlib import Path

from flask import Flask, jsonify, request
from werkzeug.utils import secure_filename

BASE_DIR = Path(__file__).resolve().parent.parent
AI_DIR = BASE_DIR / "ai_model"
if str(AI_DIR) not in sys.path:
    sys.path.append(str(AI_DIR))

app = Flask(__name__)


@app.route("/")
def home():
    return jsonify({"status": "Backend running", "ai_module": "ready"})


@app.route("/health")
def health():
    return jsonify({"status": "ok"})


@app.route("/predict", methods=["GET", "POST"])
def predict():
    if request.method == "GET":
        return jsonify({
            "message": "Use POST /predict with an image field named 'image' to run prediction.",
            "status": "ready"
        })

    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    image_file = request.files["image"]
    if image_file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    temp_path = os.path.join(tempfile.gettempdir(), secure_filename(image_file.filename))
    image_file.save(temp_path)

    try:
        from model import predict_image
        result = predict_image(temp_path)
        return jsonify(result)
    except Exception as exc:
        return jsonify({"error": "Prediction failed", "details": str(exc)}), 500
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
