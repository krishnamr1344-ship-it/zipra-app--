from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Order, OrderItem, OrderStatus, OrderStatusHistory, Product, User, UserRole
from ..schemas import OrderCreate, OrderResponse, OrderItemResponse, OrderStatusUpdate, PaymentVerify
from ..dependencies import get_current_user

router = APIRouter(prefix="/orders", tags=["orders"])


def order_to_response(order: Order) -> dict:
    return OrderResponse(
        id=order.id,
        status=order.status.value,
        total_amount=order.total_amount,
        delivery_address=order.delivery_address,
        payment_id=order.payment_id,
        created_at=order.created_at,
        items=[OrderItemResponse(
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
):
    if user.role != UserRole.customer:
        raise HTTPException(403, "Only customers can place orders")

    order = Order(
        customer_id=user.id,
        total_amount=data.total_amount,
        delivery_address=data.delivery_address,
        payment_method=data.payment_method,
    )
    db.add(order)
    db.flush()

    for item in data.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        order_item = OrderItem(
            order_id=order.id,
            product_name=product.name if product else "Unknown",
            quantity=item.quantity,
            price=item.price,
        )
        db.add(order_item)

    history = OrderStatusHistory(order_id=order.id, status=OrderStatus.placed)
    db.add(history)
    db.commit()
    db.refresh(order)

    return {
        "order_id": order.id,
        "razorpay_order_id": f"rzp_order_{order.id[:12]}",
        "amount": data.total_amount,
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
    order.payment_id = data.payment_id
    db.commit()
    return {"success": True}


@router.get("/my")
def my_orders(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    orders = db.query(Order).filter(Order.customer_id == user.id).order_by(Order.created_at.desc()).all()
    return {"orders": [order_to_response(o) for o in orders]}


@router.get("/shop")
def shop_orders(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if user.role != UserRole.shop_owner:
        raise HTTPException(403, "Only shop owners can view shop orders")

    product_ids = db.query(Product.id).filter(Product.shop_owner_id == user.id).subquery()
    order_ids = db.query(OrderItem.order_id).filter(OrderItem.product_id.in_(product_ids)).distinct().subquery()
    orders = db.query(Order).filter(Order.id.in_(order_ids)).order_by(Order.created_at.desc()).all()
    return {"orders": [order_to_response(o) for o in orders]}


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

    try:
        new_status = OrderStatus(data.status)
    except ValueError:
        raise HTTPException(400, "Invalid status")

    order.status = new_status
    history = OrderStatusHistory(order_id=order.id, status=new_status)
    db.add(history)
    db.commit()
    return {"success": True, "order": order_to_response(order)}


@router.get("")
def all_orders(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if user.role != UserRole.admin:
        raise HTTPException(403, "Admin only")
    orders = db.query(Order).order_by(Order.created_at.desc()).all()
    return {"orders": [order_to_response(o) for o in orders]}
