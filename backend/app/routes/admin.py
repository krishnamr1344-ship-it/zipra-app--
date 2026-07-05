from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User, UserRole
from ..schemas import UserRoleUpdate
from ..dependencies import get_current_user

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/users")
def list_users(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if user.role != UserRole.admin:
        raise HTTPException(403, "Admin only")
    users = db.query(User).order_by(User.created_at.desc()).all()
    return {
        "users": [
            {
                "id": u.id,
                "name": u.name,
                "email": u.email,
                "phone": u.phone,
                "role": u.role.value,
                "created_at": u.created_at.isoformat(),
            }
            for u in users
        ]
    }


@router.patch("/users/{user_id}/role")
def update_user_role(
    user_id: str,
    data: UserRoleUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if user.role != UserRole.admin:
        raise HTTPException(403, "Admin only")

    try:
        new_role = UserRole(data.role)
    except ValueError:
        raise HTTPException(400, f"Invalid role. Must be one of: {', '.join(r.value for r in UserRole)}")

    target = db.query(User).filter(User.id == user_id).first()
    if not target:
        raise HTTPException(404, "User not found")

    target.role = new_role
    db.commit()
    db.refresh(target)

    return {
        "success": True,
        "user": {
            "id": target.id,
            "name": target.name,
            "email": target.email,
            "phone": target.phone,
            "role": target.role.value,
        },
    }
