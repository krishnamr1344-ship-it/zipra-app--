import logging

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User
from ..schemas import ProfileUpdate
from ..dependencies import get_current_user

logger = logging.getLogger("zipra.profile")

router = APIRouter(prefix="/auth", tags=["profile"])


@router.get("/me")
def get_profile(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email or "",
        "phone": user.phone or "",
        "role": user.role,
    }


@router.put("/profile")
def update_profile(
    data: ProfileUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if data.name is not None:
        user.name = data.name
    if data.phone is not None:
        user.phone = data.phone
    db.commit()
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email or "",
        "phone": user.phone or "",
    }
