import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Category, User
from ..dependencies import get_current_user

logger = logging.getLogger("zipra.categories")

router = APIRouter(prefix="/categories", tags=["categories"])


def _require_seller(user: User):
    if user.role not in ("shop_owner", "admin"):
        raise HTTPException(403, "Only shop staff can manage categories")


def _to_dict(c: Category) -> dict:
    return {
        "id": str(c.id),
        "name": c.name,
        "description": c.description or "",
        "image": c.image or "",
    }


@router.get("")
def list_categories(db: Session = Depends(get_db)):
    cats = db.query(Category).filter(Category.is_deleted == False).order_by(Category.name).all()
    return {"items": [_to_dict(c) for c in cats]}


@router.post("")
def create_category(
    data: dict,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    _require_seller(user)
    name = (data.get("name") or "").strip()
    if not name:
        raise HTTPException(400, "Name is required")
    category = Category(
        name=name,
        description=data.get("description"),
        image=data.get("image"),
    )
    db.add(category)
    db.commit()
    db.refresh(category)
    return {"category": _to_dict(category)}


@router.patch("/{category_id}")
def update_category(
    category_id: str,
    data: dict,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    _require_seller(user)
    category = db.query(Category).filter(Category.id == category_id, Category.is_deleted == False).first()
    if not category:
        raise HTTPException(404, "Category not found")
    for key in ("name", "description", "image"):
        if key in data and data[key] is not None:
            setattr(category, key, data[key])
    db.commit()
    return {"category": _to_dict(category)}


@router.delete("/{category_id}")
def delete_category(
    category_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    _require_seller(user)
    category = db.query(Category).filter(Category.id == category_id, Category.is_deleted == False).first()
    if not category:
        raise HTTPException(404, "Category not found")
    category.is_deleted = True
    db.commit()
    return {"success": True}
