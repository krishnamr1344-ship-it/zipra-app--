import hashlib
import hmac
import logging
from datetime import datetime, timezone

import razorpay
from fastapi import APIRouter, Depends, HTTPException, Header, Query
from sqlalchemy.orm import Session, selectinload

from .. import config
from ..database import get_db
from ..models import Order, OrderItem, Product, User, UserRole
from ..schemas import OrderCreate, OrderResponse, OrderItemResponse, OrderStatusUpdate, PaymentVerify
from ..dependencies import get_current_user

logger = logging.getLogger("zipra.orders")
razorpay_client = razorpay.Client(auth=(config.RAZORPAY_KEY_ID, config.RAZORPAY_KEY_SECRET))
razorpay_client.timeout = 10

router = APIRouter(prefix="/orders", tags=["orders"])

VALID_TRANSITIONS = {
    "placed": ["confirmed", "cancelled"],
    "confirmed": ["out_for_delivery", "cancelled"],
    "out_for_delivery": ["delivered", "cancelled"],
    "delivered": [],
    "cancelled": [],
}


def order_to_response(order: Order) -> dict:
    addr = order.address
    delivery_address = ""
    if addr:
        parts = [addr.address_line1]
        if addr.address_line2:
            parts.append(addr.address_line2)
        parts.append(f"{addr.city}, {addr.state} - {addr.pincode}")
        delivery_address = ", ".join(parts)

    return {
        "id": order.id,
        "status": order.status,
        "total_amount": float(order.total_amount),
        "address_id": order.address_id,
        "delivery_address": delivery_address,
        "payment_method": order.payment_method,
        "delivery_fee": float(order.delivery_fee or 0),
        "delivery_otp": order.delivery_otp,
        "created_at": order.created_at.isoformat(),
        "items": [
            {
                "product_id": i.product_id,
                "product_name": i.product_name,
                "quantity": i.quantity,
                "product_price": float(i.product_price),
                "subtotal": float(i.subtotal),
                "product_image": "",
            }
            for i in order.items
        ],
    }


@router.get("/{order_id}")
def get_order(
    order_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    order = db.query(Order).options(
        selectinload(Order.items), selectinload(Order.address)
    ).filter(Order.id == order_id, Order.is_deleted == False).first()
    if not order:
        raise HTTPException(404, "Order not found")
    if order.user_id != user.id and user.role != "admin":
        raise HTTPException(403, "You can only view your own orders")
    return order_to_response(order)


@router.post("")
def create_order(
    data: OrderCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
    idempotency_key: str = Header(default="", alias="Idempotency-Key"),
):
    if user.role != "customer":
        raise HTTPException(403, "Only customers can place orders")

    if idempotency_key:
        existing = db.query(Order).filter(
            Order.idempotency_key == idempotency_key,
            Order.user_id == user.id,
        ).first()
        if existing:
            return {
                "order_id": existing.id,
                "delivery_fee": float(existing.delivery_fee or 0),
                "amount": float(existing.total_amount),
            }

    product_ids = [item.product_id for item in data.items]
    products = {
        p.id: p for p in db.query(Product).filter(Product.id.in_(product_ids)).with_for_update().all()
    }

    unavailable = [pid for pid in product_ids if pid not in products or products[pid].is_deleted]
    if unavailable:
        raise HTTPException(400, f"Products unavailable: {', '.join(unavailable)}")

    insufficient = [
        f"{products[pid].name} (need {next(i.quantity for i in data.items if i.product_id == pid)}, have {products[pid].stock})"
        for pid in product_ids
        if products[pid].stock < next(i.quantity for i in data.items if i.product_id == pid)
    ]
    if insufficient:
        raise HTTPException(400, f"Insufficient stock: {'; '.join(insufficient)}")

    total_amount = sum(
        float(products[item.product_id].price) * item.quantity
        for item in data.items
    ) + data.delivery_fee

    order = Order(
        user_id=user.id,
        total_amount=total_amount,
        address_id=data.address_id,
        payment_method=data.payment_method,
        delivery_fee=data.delivery_fee,
    )
    db.add(order)
    db.flush()

    for item in data.items:
        product = products[item.product_id]
        product.stock -= item.quantity
        subtotal = float(product.price) * item.quantity
        order_item = OrderItem(
            order_id=order.id,
            product_id=item.product_id,
            product_name=product.name,
            product_price=float(product.price),
            quantity=item.quantity,
            subtotal=subtotal,
        )
        db.add(order_item)

    razorpay_order = razorpay_client.order.create({
        "amount": int(total_amount * 100),
        "currency": "INR",
        "receipt": order.id,
    })

    order.idempotency_key = idempotency_key

    db.commit()
    db.refresh(order)

    logger.info("Order created", extra={"order_id": order.id, "amount": total_amount, "user_id": user.id})

    return {
        "order_id": order.id,
        "delivery_fee": float(order.delivery_fee or 0),
        "amount": float(total_amount),
    }


@router.patch("/{order_id}/verify")
def verify_payment(
    order_id: str,
    data: PaymentVerify,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(404, "Order not found")
    if order.user_id != user.id and user.role != "admin":
        raise HTTPException(403, "Not authorized")

    expected = hmac.new(
        config.RAZORPAY_KEY_SECRET.encode(),
        f"{order.id}|{data.payment_id}".encode(),
        hashlib.sha256,
    ).hexdigest()
    if not hmac.compare_digest(expected, data.signature):
        raise HTTPException(400, "Invalid payment signature")

    payment = razorpay_client.payment.fetch(data.payment_id)
    if payment.get("status") != "captured":
        raise HTTPException(400, "Payment not captured")

    logger.info("Payment verified", extra={"order_id": order.id, "payment_id": data.payment_id})
    return {"success": True}


@router.get("/my")
def my_orders(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
):
    query = db.query(Order).options(
        selectinload(Order.items), selectinload(Order.address)
    ).filter(Order.user_id == user.id, Order.is_deleted == False)
    total = query.count()
    orders = query.order_by(Order.created_at.desc()).offset((page - 1) * per_page).limit(per_page).all()
    return {"orders": [order_to_response(o) for o in orders], "total": total, "page": page, "per_page": per_page}


@router.get("/shop")
def shop_orders(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
):
    if user.role != "shop_owner":
        raise HTTPException(403, "Only shop owners can view shop orders")
    product_ids = db.query(Product.id).filter(Product.is_deleted == False).subquery()
    order_ids_q = db.query(OrderItem.order_id).filter(OrderItem.product_id.in_(product_ids)).distinct().subquery()
    query = db.query(Order).options(
        selectinload(Order.items), selectinload(Order.address)
    ).filter(Order.id.in_(order_ids_q), Order.is_deleted == False)
    total = query.count()
    orders = query.order_by(Order.created_at.desc()).offset((page - 1) * per_page).limit(per_page).all()
    return {"orders": [order_to_response(o) for o in orders], "total": total, "page": page, "per_page": per_page}


@router.patch("/{order_id}/status")
def update_order_status(
    order_id: str,
    data: OrderStatusUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(404, "Order not found")
    if user.role not in ("shop_owner", "admin"):
        raise HTTPException(403, "Only shop owners can update status")

    if data.status not in VALID_TRANSITIONS.get(order.status, []):
        allowed = VALID_TRANSITIONS.get(order.status, [])
        raise HTTPException(
            400,
            f"Cannot transition from '{order.status}' to '{data.status}'. "
            f"Allowed: {allowed or ['none']}",
        )

    order.status = data.status
    db.commit()
    return {"success": True, "order": order_to_response(order)}


@router.get("")
def all_orders(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
):
    if user.role != "admin":
        raise HTTPException(403, "Admin only")
    query = db.query(Order).options(
        selectinload(Order.items), selectinload(Order.address)
    ).filter(Order.is_deleted == False)
    total = query.count()
    orders = query.order_by(Order.created_at.desc()).offset((page - 1) * per_page).limit(per_page).all()
    return {"orders": [order_to_response(o) for o in orders], "total": total, "page": page, "per_page": per_page}
