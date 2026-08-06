import os
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent))
from app import app


def test_home_route():
    client = app.test_client()
    response = client.get('/')
    assert response.status_code == 200


def test_predict_route_requires_image():
    client = app.test_client()
    response = client.post('/predict')
    assert response.status_code == 400
