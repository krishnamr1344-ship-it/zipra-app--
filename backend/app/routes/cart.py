import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import CartItem, Product, User
from ..schemas import CartItemCreate, CartItemUpdate
from ..dependencies import get_current_user

logger = logging.getLogger("zipra.cart")

router = APIRouter(prefix="/cart", tags=["cart"])


def item_to_dict(item: CartItem) -> dict:
    p = item.product
    price = float(p.price) if p else 0
    return {
        "id": item.id,
        "product_id": item.product_id,
        "product_name": p.name if p else "Unknown",
        "product_price": price,
        "product_image": p.image if p else "",
        "product_unit": p.unit if p else "",
        "quantity": item.quantity,
        "subtotal": price * item.quantity,
    }


@router.get("")
def get_cart(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    items = db.query(CartItem).filter(CartItem.user_id == user.id, CartItem.is_deleted == False).all()
    mapped = [item_to_dict(i) for i in items]
    return {"items": mapped, "total": sum(i["subtotal"] for i in mapped)}


@router.post("")
def add_to_cart(
    data: CartItemCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    product = db.query(Product).filter(Product.id == data.product_id, Product.is_deleted == False).first()
    if not product:
        raise HTTPException(404, "Product not found")

    existing = db.query(CartItem).filter(
        CartItem.user_id == user.id,
        CartItem.product_id == data.product_id,
        CartItem.is_deleted == False,
    ).first()

    if existing:
        existing.quantity += data.quantity
    else:
        existing = CartItem(user_id=user.id, product_id=data.product_id, quantity=data.quantity)
        db.add(existing)

    db.commit()
    db.refresh(existing)
    return item_to_dict(existing)


@router.put("/{item_id}")
def update_cart_item(
    item_id: str,
    data: CartItemUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    item = db.query(CartItem).filter(CartItem.id == item_id, CartItem.user_id == user.id).first()
    if not item:
        raise HTTPException(404, "Cart item not found")
    item.quantity = data.quantity
    db.commit()
    db.refresh(item)
    return item_to_dict(item)


@router.delete("/{item_id}")
def remove_cart_item(
    item_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    item = db.query(CartItem).filter(CartItem.id == item_id, CartItem.user_id == user.id).first()
    if not item:
        raise HTTPException(404, "Cart item not found")
    item.is_deleted = True
    db.commit()
    return {"success": True}


@router.delete("")
def clear_cart(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    db.query(CartItem).filter(CartItem.user_id == user.id).update({"is_deleted": True})
    db.commit()
    return {"success": True}
