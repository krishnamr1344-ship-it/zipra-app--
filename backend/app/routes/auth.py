import logging

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from ..dependencies import get_firebase_app, get_or_create_user, limiter
from ..database import get_db
from ..models import User
from ..schemas import UserResponse

logger = logging.getLogger("zipra.auth")

router = APIRouter(prefix="/auth", tags=["auth"])


def get_user_response(user: User, token: str = "") -> UserResponse:
    return UserResponse(
        id=user.id,
        name=user.name,
        email=user.email or "",
        phone=user.phone or "",
        role=user.role.value,
        token=token,
    )


@router.post("/verify-firebase")
@limiter.limit("10/minute")
def verify_firebase(request: Request, data: dict, db: Session = Depends(get_db)):
    import firebase_admin.auth as firebase_auth

    id_token = data.get("id_token")
    if not id_token:
        raise HTTPException(400, "id_token required")

    try:
        get_firebase_app()
        decoded = firebase_auth.verify_id_token(id_token)
        firebase_uid = decoded["uid"]
        user = get_or_create_user(db, decoded)
        return {"success": True, "user": get_user_response(user, token=id_token).model_dump()}
    except Exception as e:
        logger.error("Firebase verify failed: %s", e)
        raise HTTPException(401, "Invalid or expired authentication token")
