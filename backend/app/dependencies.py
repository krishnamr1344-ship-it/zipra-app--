import json
import logging
import os
import threading

from fastapi import Depends, HTTPException, Header
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
import firebase_admin
from firebase_admin import auth as firebase_auth, credentials

from .database import get_db
from .models import User

logger = logging.getLogger("zipra.auth")

_initialized = False
_init_lock = threading.Lock()


def get_firebase_app():
    global _initialized
    if not _initialized:
        with _init_lock:
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


def _revocation_check_enabled() -> bool:
    """Revocation checks require valid Firebase credentials to fetch the
    revocation state. Only enable it when credentials are configured so we
    stay secure in production yet don't break environments without them."""
    return bool(os.getenv("FIREBASE_CREDENTIALS"))


def get_or_create_user(db: Session, decoded: dict) -> User:
    firebase_uid = decoded["uid"]
    user = db.query(User).filter(User.firebase_uid == firebase_uid).first()
    if not user:
        phone = decoded.get("phone_number") or ""
        email = decoded.get("email") or None
        name = decoded.get("name") or email or "User"
        try:
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
        except IntegrityError:
            db.rollback()
            user = db.query(User).filter(User.firebase_uid == firebase_uid).one()
    return user


def get_current_user(
    authorization: str = Header(default=""),
    db: Session = Depends(get_db),
) -> User:
    if not authorization.startswith("Bearer "):
        raise HTTPException(401, "Invalid authorization header")

    token = authorization[7:]
    try:
        get_firebase_app()
        decoded = firebase_auth.verify_id_token(
            token, check_revoked=_revocation_check_enabled()
        )
        firebase_uid = decoded.get("uid")
    except Exception as e:
        logger.error("Token verification failed: %s", e)
        raise HTTPException(401, "Invalid or expired authentication token")

    return get_or_create_user(db, decoded)


limiter = Limiter(key_func=get_remote_address, default_limits=["200/minute"])
