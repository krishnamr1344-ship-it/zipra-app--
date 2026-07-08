import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Address, User
from ..schemas import AddressCreate, AddressUpdate
from ..dependencies import get_current_user

logger = logging.getLogger("zipra.addresses")

router = APIRouter(prefix="/addresses", tags=["addresses"])


def addr_to_dict(a: Address) -> dict:
    return {
        "id": a.id,
        "label": a.label,
        "address_type": a.address_type,
        "address_line1": a.address_line1,
        "address_line2": a.address_line2 or "",
        "house_number": a.house_number or "",
        "floor_number": a.floor_number or "",
        "city": a.city,
        "state": a.state,
        "pincode": a.pincode,
        "landmark": a.landmark or "",
        "latitude": float(a.latitude) if a.latitude else None,
        "longitude": float(a.longitude) if a.longitude else None,
        "is_default": a.is_default,
    }


@router.get("")
def list_addresses(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    addrs = db.query(Address).filter(Address.user_id == user.id, Address.is_deleted == False).order_by(Address.is_default.desc()).all()
    return [addr_to_dict(a) for a in addrs]


@router.post("")
def create_address(
    data: AddressCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if data.is_default:
        db.query(Address).filter(Address.user_id == user.id).update({"is_default": False})
    addr = Address(user_id=user.id, **data.model_dump())
    db.add(addr)
    db.commit()
    db.refresh(addr)
    return addr_to_dict(addr)


@router.put("/{addr_id}")
def update_address(
    addr_id: str,
    data: AddressUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    addr = db.query(Address).filter(Address.id == addr_id, Address.user_id == user.id).first()
    if not addr:
        raise HTTPException(404, "Address not found")
    if data.is_default:
        db.query(Address).filter(Address.user_id == user.id, Address.id != addr_id).update({"is_default": False})
    for key, val in data.model_dump(exclude_unset=True).items():
        setattr(addr, key, val)
    db.commit()
    db.refresh(addr)
    return addr_to_dict(addr)


@router.delete("/{addr_id}")
def delete_address(
    addr_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    addr = db.query(Address).filter(Address.id == addr_id, Address.user_id == user.id).first()
    if not addr:
        raise HTTPException(404, "Address not found")
    addr.is_deleted = True
    db.commit()
    return {"success": True}


@router.post("/{addr_id}/default")
def set_default_address(
    addr_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    addr = db.query(Address).filter(Address.id == addr_id, Address.user_id == user.id).first()
    if not addr:
        raise HTTPException(404, "Address not found")
    db.query(Address).filter(Address.user_id == user.id).update({"is_default": False})
    addr.is_default = True
    db.commit()
    return {"success": True}
