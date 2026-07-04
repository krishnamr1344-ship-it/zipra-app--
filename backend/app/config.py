import os

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:Ffiey6iZc78%24GVS@db.gnoypcoithdbbishbyby.supabase.co:5432/postgres?sslmode=require"
)
SECRET_KEY = os.getenv("SECRET_KEY", "zipra-prod-secret-key-2026")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7

FIREBASE_CREDENTIALS = os.getenv("FIREBASE_CREDENTIALS", "")
FIREBASE_PROJECT_ID = os.getenv("FIREBASE_PROJECT_ID", "zipra-app")
