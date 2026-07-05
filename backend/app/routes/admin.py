import logging

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User, UserRole
from ..schemas import UserRoleUpdate
from ..dependencies import get_current_user

logger = logging.getLogger("zipra.admin")
router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/users")
def list_users(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
):
    if user.role != UserRole.admin:
        raise HTTPException(403, "Admin only")
    query = db.query(User)
    total = query.count()
    users = query.order_by(User.created_at.desc()).offset((page - 1) * per_page).limit(per_page).all()
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
        ],
        "total": total,
        "page": page,
        "per_page": per_page,
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

    if target.id == user.id and new_role != UserRole.admin:
        raise HTTPException(400, "You cannot demote yourself from admin")

    target.role = new_role
    db.commit()
    db.refresh(target)

    logger.info(
        "Role changed",
        extra={"target_user": target.id, "new_role": new_role.value, "changed_by": user.id},
    )

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
