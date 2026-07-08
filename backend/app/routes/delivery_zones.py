import json
import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import DeliveryZone, User
from ..dependencies import get_current_user

logger = logging.getLogger("zipra.delivery_zones")

router = APIRouter(prefix="/delivery-zones", tags=["delivery-zones"])


def zone_to_dict(z: DeliveryZone) -> dict:
    return {
        "id": z.id,
        "name": z.name,
        "coordinates": json.loads(z.coordinates) if isinstance(z.coordinates, str) else z.coordinates,
        "delivery_fee": float(z.delivery_fee),
        "free_delivery_above": float(z.free_delivery_above),
        "is_active": z.is_active,
    }


@router.get("")
def list_zones(db: Session = Depends(get_db)):
    zones = db.query(DeliveryZone).filter(DeliveryZone.is_deleted == False).order_by(DeliveryZone.name).all()
    return {"items": [zone_to_dict(z) for z in zones]}


def _point_in_polygon(lat: float, lng: float, polygon: list) -> bool:
    n = len(polygon)
    inside = False
    j = n - 1
    for i in range(n):
        yi, xi = polygon[i]
        yj, xj = polygon[j]
        if ((yi > lat) != (yj > lat)) and (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi):
            inside = not inside
        j = i
    return inside


@router.get("/check")
def check_zone(lat: float, lng: float, db: Session = Depends(get_db)):
    zones = db.query(DeliveryZone).filter(
        DeliveryZone.is_active == True,
        DeliveryZone.is_deleted == False,
    ).all()

    for z in zones:
        coords = json.loads(z.coordinates) if isinstance(z.coordinates, str) else z.coordinates
        if len(coords) < 3:
            continue
        if _point_in_polygon(lat, lng, coords):
            return {
                "in_zone": True,
                "zone": zone_to_dict(z),
            }

    return {"in_zone": False, "zone": None}


@router.post("")
def create_zone(
    data: dict,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if user.role not in ("admin", "shop_owner"):
        raise HTTPException(403, "Admin only")

    coords = data.get("coordinates")
    if not coords or not isinstance(coords, list) or len(coords) < 3:
        raise HTTPException(400, "Zone must have at least 3 coordinate pairs")

    zone = DeliveryZone(
        name=data["name"],
        coordinates=json.dumps(coords),
        delivery_fee=float(data.get("delivery_fee", 0)),
        free_delivery_above=float(data.get("free_delivery_above", 0)),
        is_active=data.get("is_active", True),
    )
    db.add(zone)
    db.commit()
    db.refresh(zone)
    return zone_to_dict(zone)


@router.put("/{zone_id}")
def update_zone(
    zone_id: str,
    data: dict,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if user.role not in ("admin", "shop_owner"):
        raise HTTPException(403, "Admin only")

    zone = db.query(DeliveryZone).filter(DeliveryZone.id == zone_id, DeliveryZone.is_deleted == False).first()
    if not zone:
        raise HTTPException(404, "Zone not found")

    for key in ("name", "delivery_fee", "free_delivery_above", "is_active"):
        if key in data:
            setattr(zone, key, data[key])
    if "coordinates" in data:
        zone.coordinates = json.dumps(data["coordinates"])

    db.commit()
    return zone_to_dict(zone)


@router.delete("/{zone_id}")
def delete_zone(
    zone_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if user.role not in ("admin", "shop_owner"):
        raise HTTPException(403, "Admin only")

    zone = db.query(DeliveryZone).filter(DeliveryZone.id == zone_id, DeliveryZone.is_deleted == False).first()
    if not zone:
        raise HTTPException(404, "Zone not found")

    zone.is_deleted = True
    db.commit()
    return {"success": True}
