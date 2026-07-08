import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Banner, User
from ..schemas import BannerCreate, BannerUpdate
from ..dependencies import get_current_user

logger = logging.getLogger("zipra.banners")

router = APIRouter(prefix="/banners", tags=["banners"])


def _require_seller(user: User):
    if user.role not in ("shop_owner", "admin"):
        raise HTTPException(403, "Only shop staff can manage banners")


def _to_dict(b: Banner) -> dict:
    return {
        "id": str(b.id),
        "title": b.title,
        "subtitle": b.subtitle or "",
        "image_url": b.image_url or "",
        "link": b.link or "",
        "color": b.color,
        "is_active": b.is_active,
        "sort_order": b.sort_order,
    }


@router.get("")
def list_banners(db: Session = Depends(get_db)):
    banners = db.query(Banner).filter(Banner.is_active == True, Banner.is_deleted == False).order_by(Banner.sort_order, Banner.created_at.desc()).all()
    return {"items": [_to_dict(b) for b in banners]}


@router.post("")
def create_banner(
    data: BannerCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    _require_seller(user)
    banner = Banner(
        title=data.title,
        subtitle=data.subtitle,
        image_url=data.image_url,
        link=data.link,
        color=data.color,
        is_active=data.is_active,
        sort_order=data.sort_order,
    )
    db.add(banner)
    db.commit()
    db.refresh(banner)
    return {"banner": _to_dict(banner)}


@router.patch("/{banner_id}")
def update_banner(
    banner_id: str,
    data: BannerUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    _require_seller(user)
    banner = db.query(Banner).filter(Banner.id == banner_id, Banner.is_deleted == False).first()
    if not banner:
        raise HTTPException(404, "Banner not found")
    for key in ("title", "subtitle", "image_url", "link", "color", "is_active", "sort_order"):
        val = getattr(data, key, None)
        if val is not None:
            setattr(banner, key, val)
    db.commit()
    return {"banner": _to_dict(banner)}


@router.delete("/{banner_id}")
def delete_banner(
    banner_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    _require_seller(user)
    banner = db.query(Banner).filter(Banner.id == banner_id, Banner.is_deleted == False).first()
    if not banner:
        raise HTTPException(404, "Banner not found")
    banner.is_deleted = True
    db.commit()
    return {"success": True}
