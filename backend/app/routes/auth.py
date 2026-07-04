import random
from datetime import datetime, timezone, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from jose import jwt
from passlib.context import CryptContext

from ..database import get_db
from ..models import User, UserRole
from ..schemas import UserCreate, UserLogin, PhoneOtpRequest, VerifyOtpRequest, UserResponse
from ..config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter(prefix="/auth", tags=["auth"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

otp_store: dict[str, dict] = {}


def create_token(user: User) -> str:
    payload = {
        "sub": user.id,
        "role": user.role.value,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def get_user_response(user: User) -> UserResponse:
    return UserResponse(
        id=user.id,
        name=user.name,
        email=user.email or "",
        phone=user.phone,
        role=user.role.value,
        token=create_token(user),
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
        password_hash=pwd_context.hash(data.password),
        role=UserRole(data.role),
    )
    db.add(user)
    db.commit()
    return {"success": True, "user": get_user_response(user).model_dump()}


@router.post("/login")
def login(data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not user.password_hash:
        raise HTTPException(401, "Invalid credentials")
    if not pwd_context.verify(data.password, user.password_hash):
        raise HTTPException(401, "Invalid credentials")
    return {"success": True, "user": get_user_response(user).model_dump()}


@router.post("/send-otp")
def send_otp(data: PhoneOtpRequest, db: Session = Depends(get_db)):
    phone = data.phone
    otp = "1234"
    otp_store[phone] = {"otp": otp, "expires": datetime.now(timezone.utc) + timedelta(minutes=5)}
    user = db.query(User).filter(User.phone == phone).first()
    is_new = user is None
    return {"success": True, "otp": otp, "is_new": is_new, "message": "Use OTP: 1234 (dev mode)"}


@router.post("/verify-otp")
def verify_otp(data: VerifyOtpRequest, db: Session = Depends(get_db)):
    phone = data.phone
    stored = otp_store.get(phone)
    if not stored:
        raise HTTPException(400, "No OTP sent")
    if stored["expires"] < datetime.now(timezone.utc):
        raise HTTPException(400, "OTP expired")
    if stored["otp"] != data.otp:
        raise HTTPException(400, "Invalid OTP")

    del otp_store[phone]
    user = db.query(User).filter(User.phone == phone).first()
    if not user:
        user = User(name="User", phone=phone, role=UserRole.customer)
        db.add(user)
        db.commit()
        db.refresh(user)

    return {"success": True, "user": get_user_response(user).model_dump()}
