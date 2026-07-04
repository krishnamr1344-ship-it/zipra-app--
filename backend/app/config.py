import os

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://localhost:5432/zipra")
SECRET_KEY = os.getenv("SECRET_KEY", "zipra-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days
RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "")
