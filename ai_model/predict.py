import argparse
import json
import os

from model import predict_image


def main() -> None:
    parser = argparse.ArgumentParser(description="Predict an eye disease from an uploaded image")
    parser.add_argument("image_path", help="Path to the image file")
    parser.add_argument("--model", default=None, help="Optional path to the trained model file")
    args = parser.parse_args()

    if not os.path.exists(args.image_path):
        raise FileNotFoundError(f"Image file not found: {args.image_path}")

    result = predict_image(args.image_path, args.model)
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
