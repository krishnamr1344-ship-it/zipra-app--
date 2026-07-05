import random
from datetime import datetime, timezone, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from jose import jwt
from passlib.context import CryptContext

from ..dependencies import get_firebase_app
from ..database import get_db
from ..models import User, UserRole
from ..schemas import UserCreate, UserLogin, PhoneOtpRequest, VerifyOtpRequest, UserResponse

router = APIRouter(prefix="/auth", tags=["auth"])


def get_user_response(user: User, token: str = "") -> UserResponse:
    return UserResponse(
        id=user.id,
        name=user.name,
        email=user.email or "",
        phone=user.phone,
        role=user.role.value,
        token=token,
    )


@router.post("/signup")
def signup(data: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(
        (User.phone == data.phone) | (User.email == data.email)
    ).first()
    if existing:
        raise HTTPException(400, "User already exists")

    user = User(
        name=data.name,
        email=data.email,
        phone=data.phone,
        role=UserRole(data.role),
    )
    db.add(user)
    db.commit()
    return {"success": True, "user": get_user_response(user).model_dump()}


@router.post("/verify-firebase")
def verify_firebase(data: dict, db: Session = Depends(get_db)):
    import firebase_admin.auth as firebase_auth

    id_token = data.get("id_token")
    if not id_token:
        raise HTTPException(400, "id_token required")

    try:
        get_firebase_app()
        decoded = firebase_auth.verify_id_token(id_token)
        firebase_uid = decoded["uid"]
        phone = decoded.get("phone_number", "") or ""
        email = decoded.get("email") or None
        name = decoded.get("name") or email or phone

        user = db.query(User).filter(User.firebase_uid == firebase_uid).first()
        if not user:
            user = User(
                firebase_uid=firebase_uid,
                name=name,
                phone=phone,
                email=email,
                role=UserRole.customer,
            )
            db.add(user)
            db.commit()
            db.refresh(user)

        return {"success": True, "user": get_user_response(user, token=id_token).model_dump()}
    except Exception as e:
        raise HTTPException(401, f"Invalid Firebase token: {e}")
