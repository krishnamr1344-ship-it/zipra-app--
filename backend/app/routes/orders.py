import hashlib
import hmac
import logging
from datetime import datetime, timezone

import razorpay
from fastapi import APIRouter, Depends, HTTPException, Header, Query
from sqlalchemy.orm import Session, selectinload

from .. import config
from ..database import get_db
from ..models import Order, OrderItem, OrderStatus, OrderStatusHistory, Product, User, UserRole
from ..schemas import OrderCreate, OrderResponse, OrderItemResponse, OrderStatusUpdate, PaymentVerify
from ..dependencies import get_current_user

logger = logging.getLogger("zipra.orders")
razorpay_client = razorpay.Client(auth=(config.RAZORPAY_KEY_ID, config.RAZORPAY_KEY_SECRET))
razorpay_client.timeout = 10

router = APIRouter(prefix="/orders", tags=["orders"])

VALID_TRANSITIONS = {
    OrderStatus.placed: [OrderStatus.accepted, OrderStatus.cancelled],
    OrderStatus.accepted: [OrderStatus.preparing, OrderStatus.cancelled],
    OrderStatus.preparing: [OrderStatus.out_for_delivery, OrderStatus.cancelled],
    OrderStatus.out_for_delivery: [OrderStatus.delivered],
    OrderStatus.delivered: [],
    OrderStatus.cancelled: [],
}


def order_to_response(order: Order) -> dict:
    return OrderResponse(
        id=order.id,
        status=order.status.value,
        total_amount=order.total_amount,
        delivery_address=order.delivery_address,
        payment_id=order.payment_id,
        created_at=order.created_at,
        items=[OrderItemResponse(
            product_id=i.product_id,
            product_name=i.product_name,
            quantity=i.quantity,
            price=i.price,
        ) for i in order.items],
    ).model_dump()


@router.post("")
def create_order(
    data: OrderCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
    idempotency_key: str = Header(default="", alias="Idempotency-Key"),
):
    if user.role != UserRole.customer:
        raise HTTPException(403, "Only customers can place orders")

    if idempotency_key:
        existing = db.query(Order).filter(
            Order.idempotency_key == idempotency_key,
            Order.customer_id == user.id,
        ).first()
        if existing:
            return {
                "order_id": existing.id,
                "razorpay_order_id": existing.razorpay_order_id,
                "amount": existing.total_amount,
            }

    product_ids = [item.product_id for item in data.items]
    products = {
        p.id: p for p in db.query(Product).filter(Product.id.in_(product_ids)).with_for_update().all()
    }

    unavailable = [pid for pid in product_ids if pid not in products or not products[pid].is_available]
    if unavailable:
        raise HTTPException(400, f"Products unavailable or not found: {', '.join(unavailable)}")

    insufficient = [
        f"{products[pid].name} (requested {next(i.quantity for i in data.items if i.product_id == pid)}, available {products[pid].stock_quantity})"
        for pid in product_ids
        if products[pid].stock_quantity < next(i.quantity for i in data.items if i.product_id == pid)
    ]
    if insufficient:
        raise HTTPException(400, f"Insufficient stock: {'; '.join(insufficient)}")

    total_amount = sum(products[item.product_id].price * item.quantity for item in data.items)

    order = Order(
        customer_id=user.id,
        total_amount=total_amount,
        delivery_address=data.delivery_address,
        payment_method=data.payment_method,
    )
    db.add(order)
    db.flush()

    for item in data.items:
        product = products[item.product_id]
        product.stock_quantity -= item.quantity
        order_item = OrderItem(
            order_id=order.id,
            product_id=item.product_id,
            product_name=product.name,
            quantity=item.quantity,
            price=product.price,
        )
        db.add(order_item)

    razorpay_order = razorpay_client.order.create({
        "amount": int(total_amount * 100),
        "currency": "INR",
        "receipt": order.id,
    })
    order.razorpay_order_id = razorpay_order["id"]
    order.idempotency_key = idempotency_key

    history = OrderStatusHistory(order_id=order.id, status=OrderStatus.placed)
    db.add(history)
    db.commit()
    db.refresh(order)

    logger.info("Order created", extra={"order_id": order.id, "amount": total_amount, "user_id": user.id})

    return {
        "order_id": order.id,
        "razorpay_order_id": razorpay_order["id"],
        "amount": total_amount,
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

    if order.customer_id != user.id and user.role != UserRole.admin:
        raise HTTPException(403, "You can only verify your own orders")

    expected = hmac.new(
        config.RAZORPAY_KEY_SECRET.encode(),
        f"{order.id}|{data.payment_id}".encode(),
        hashlib.sha256,
    ).hexdigest()
    if not hmac.compare_digest(expected, data.signature):
        raise HTTPException(400, "Invalid payment signature")

    payment = razorpay_client.payment.fetch(data.payment_id)
    if payment.get("status") != "captured":
        logger.warning("Payment not captured", extra={"order_id": order.id, "payment_id": data.payment_id})
        raise HTTPException(400, "Payment not captured")

    order.payment_id = data.payment_id
    db.commit()
    logger.info("Payment verified", extra={"order_id": order.id, "payment_id": data.payment_id, "user_id": user.id})
    return {"success": True}


@router.get("/my")
def my_orders(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
):
    query = db.query(Order).options(selectinload(Order.items)).filter(Order.customer_id == user.id)
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
    if user.role != UserRole.shop_owner:
        raise HTTPException(403, "Only shop owners can view shop orders")

    product_ids = db.query(Product.id).filter(Product.shop_owner_id == user.id).subquery()
    order_ids_q = db.query(OrderItem.order_id).filter(OrderItem.product_id.in_(product_ids)).distinct().subquery()
    query = db.query(Order).options(selectinload(Order.items)).filter(Order.id.in_(order_ids_q))
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

    if user.role not in [UserRole.shop_owner, UserRole.admin]:
        raise HTTPException(403, "Only shop owners can update status")

    if user.role == UserRole.shop_owner:
        owns_product_in_order = db.query(OrderItem.id).join(Product).filter(
            OrderItem.order_id == order.id,
            Product.shop_owner_id == user.id,
        ).first()
        if not owns_product_in_order:
            raise HTTPException(403, "You can only update orders containing your products")

    try:
        new_status = OrderStatus(data.status)
    except ValueError:
        raise HTTPException(400, "Invalid status")

    allowed = VALID_TRANSITIONS.get(order.status, [])
    if new_status not in allowed:
        raise HTTPException(
            400,
            f"Cannot transition from '{order.status.value}' to '{new_status.value}'. "
            f"Allowed transitions: {[s.value for s in allowed] or ['none']}",
        )

    order.status = new_status
    history = OrderStatusHistory(order_id=order.id, status=new_status)
    db.add(history)
    db.commit()
    return {"success": True, "order": order_to_response(order)}


@router.get("")
def all_orders(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
):
    if user.role != UserRole.admin:
        raise HTTPException(403, "Admin only")
    query = db.query(Order).options(selectinload(Order.items))
    total = query.count()
    orders = query.order_by(Order.created_at.desc()).offset((page - 1) * per_page).limit(per_page).all()
    return {"orders": [order_to_response(o) for o in orders], "total": total, "page": page, "per_page": per_page}
