import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Product, User, WishlistItem
from ..dependencies import get_current_user

logger = logging.getLogger("zipra.wishlist")

router = APIRouter(prefix="/wishlist", tags=["wishlist"])


def item_to_dict(item: WishlistItem) -> dict:
    p = item.product
    price = float(p.price) if p else 0
    return {
        "product_id": item.product_id,
        "product_name": p.name if p else "Unknown",
        "product_final_price": price,
        "product_price": price,
        "product_unit": p.unit if p else "",
        "product_image": p.image if p else "",
    }


@router.get("")
def list_wishlist(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    items = db.query(WishlistItem).filter(WishlistItem.user_id == user.id, WishlistItem.is_deleted == False).all()
    return [item_to_dict(i) for i in items]


@router.post("")
def add_to_wishlist(
    data: dict,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    product_id = data.get("product_id")
    if not product_id:
        raise HTTPException(400, "product_id is required")

    product = db.query(Product).filter(Product.id == product_id, Product.is_deleted == False).first()
    if not product:
        raise HTTPException(404, "Product not found")

    existing = db.query(WishlistItem).filter(
        WishlistItem.user_id == user.id,
        WishlistItem.product_id == product_id,
        WishlistItem.is_deleted == False,
    ).first()

    if existing:
        return item_to_dict(existing)

    item = WishlistItem(user_id=user.id, product_id=product_id)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item_to_dict(item)


@router.delete("/{product_id}")
def remove_from_wishlist(
    product_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    item = db.query(WishlistItem).filter(
        WishlistItem.user_id == user.id,
        WishlistItem.product_id == product_id,
    ).first()
    if not item:
        raise HTTPException(404, "Wishlist item not found")
    item.is_deleted = True
    db.commit()
    return {"success": True}
