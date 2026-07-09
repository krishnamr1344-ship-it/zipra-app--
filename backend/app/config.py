import os

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL environment variable is required")

RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET")
if not RAZORPAY_KEY_ID or not RAZORPAY_KEY_SECRET:
    raise RuntimeError("RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET environment variables are required")

CORS_ORIGINS = (os.getenv("CORS_ORIGINS") or "*").split(",")

FIREBASE_CREDENTIALS = os.getenv("FIREBASE_CREDENTIALS", "")
