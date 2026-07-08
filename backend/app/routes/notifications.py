import logging

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Notification, User
from ..dependencies import get_current_user

logger = logging.getLogger("zipra.notifications")

router = APIRouter(prefix="/notifications", tags=["notifications"])


def notif_to_dict(n: Notification) -> dict:
    return {
        "id": n.id,
        "type": n.type,
        "title": n.title,
        "message": n.message or "",
        "image_url": n.image_url or "",
        "link": n.link or "",
        "is_read": n.is_read,
        "created_at": n.created_at.isoformat(),
    }


@router.get("")
def list_notifications(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    notifs = db.query(Notification).filter(Notification.is_deleted == False).order_by(Notification.created_at.desc()).limit(50).all()
    return {"items": [notif_to_dict(n) for n in notifs]}


@router.post("/{notif_id}/read")
def mark_read(
    notif_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    notif = db.query(Notification).filter(Notification.id == notif_id).first()
    if notif:
        notif.is_read = True
        db.commit()
    return {"success": True}


@router.post("/read-all")
def mark_all_read(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    db.query(Notification).filter(Notification.is_read == False, Notification.is_deleted == False).update({"is_read": True})
    db.commit()
    return {"success": True}
