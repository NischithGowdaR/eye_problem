import os
from datetime import timedelta

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "development-only-change-me")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", SECRET_KEY)
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    MAX_CONTENT_LENGTH = int(os.getenv("MAX_UPLOAD_BYTES", 5 * 1024 * 1024))
    UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), "uploads")
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
