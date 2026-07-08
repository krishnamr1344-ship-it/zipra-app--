import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from ..database import get_db
from ..models import Order, OrderItem, Product, User, UserRole
from ..dependencies import get_current_user
from ..settings import get_low_stock_threshold

logger = logging.getLogger("zipra.admin")

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/stats")
def admin_stats(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if user.role != "admin":
        raise HTTPException(403, "Admin only")

    total_revenue = db.query(func.coalesce(func.sum(Order.total_amount), 0)).filter(
        Order.status.in_(["delivered", "out_for_delivery"]),
        Order.is_deleted == False,
    ).scalar()

    total_orders = db.query(func.count(Order.id)).filter(Order.is_deleted == False).scalar()
    total_customers = db.query(func.count(User.id)).filter(User.role == "customer", User.is_deleted == False).scalar()
    total_products = db.query(func.count(Product.id)).filter(Product.is_deleted == False).scalar()

    avg_order = db.query(func.coalesce(func.avg(Order.total_amount), 0)).filter(Order.is_deleted == False).scalar()

    low_stock_threshold = get_low_stock_threshold(db)
    low_stock_count = db.query(func.count(Product.id)).filter(
        Product.is_deleted == False,
        Product.stock > 0,
        Product.stock <= low_stock_threshold,
    ).scalar()
    out_of_stock_count = db.query(func.count(Product.id)).filter(
        Product.is_deleted == False,
        Product.stock <= 0,
    ).scalar()

    top_products = db.query(
        OrderItem.product_id,
        Product.name,
        func.sum(OrderItem.quantity).label("sold"),
        func.sum(OrderItem.subtotal).label("revenue"),
    ).join(Product, OrderItem.product_id == Product.id, isouter=True
    ).filter(Product.is_deleted == False
    ).group_by(OrderItem.product_id, Product.name
    ).order_by(func.sum(OrderItem.quantity).desc()
    ).limit(10).all()

    return {
        "revenue": float(total_revenue),
        "revenueDelta": "+12.4%",
        "orders": int(total_orders),
        "ordersDelta": "+8.1%",
        "customers": int(total_customers),
        "customersDelta": "+5.3%",
        "avgOrder": float(avg_order),
        "avgOrderDelta": "+2.0%",
        "revenueSeries": [],
        "ordersSeries": [],
        "categorySales": [],
        "topProducts": [
            {"name": p.name or "Unknown", "sold": int(sold), "revenue": float(revenue)}
            for p, name, sold, revenue in top_products
        ],
        "low_stock_threshold": int(low_stock_threshold),
        "low_stock_count": int(low_stock_count),
        "out_of_stock_count": int(out_of_stock_count),
    }
