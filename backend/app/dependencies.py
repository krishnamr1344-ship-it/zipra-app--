import json
import os

from fastapi import Depends, HTTPException, Header
from sqlalchemy.orm import Session
import firebase_admin
from firebase_admin import auth as firebase_auth, credentials

from .database import get_db
from .models import User

_initialized = False


def get_firebase_app():
    global _initialized
    if not _initialized:
        cred_json = os.getenv("FIREBASE_CREDENTIALS")
        if cred_json:
            cred_dict = json.loads(cred_json)
            cred = credentials.Certificate(cred_dict)
            firebase_admin.initialize_app(cred)
        else:
            firebase_admin.initialize_app()
        _initialized = True
    return firebase_admin.get_app()


def get_current_user(
    authorization: str = Header(default=""),
    db: Session = Depends(get_db),
) -> User:
    if not authorization.startswith("Bearer "):
        raise HTTPException(401, "Invalid authorization header")

    token = authorization[7:]
    try:
        get_firebase_app()
        decoded = firebase_auth.verify_id_token(token)
        firebase_uid = decoded.get("uid")
    except Exception as e:
        raise HTTPException(401, f"Invalid token: {e}")

    user = db.query(User).filter(User.firebase_uid == firebase_uid).first()
    if not user:
        phone = decoded.get("phone_number", "")
        email = decoded.get("email", "")
        name = decoded.get("name", "") or email or phone
        user = User(
            firebase_uid=firebase_uid,
            name=name,
            phone=phone,
            email=email,
            role="customer",
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    return user
