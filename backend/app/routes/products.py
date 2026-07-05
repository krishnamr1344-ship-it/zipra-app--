from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Product, User, UserRole
from ..schemas import ProductCreate, ProductUpdate, ProductResponse
from ..dependencies import get_current_user

router = APIRouter(prefix="/products", tags=["products"])


@router.get("")
def list_products(
    category: str = "",
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = db.query(Product).filter(Product.is_available == True)
    if category:
        query = query.filter(Product.category == category)
    total = query.count()
    products = query.order_by(Product.created_at.desc()).offset((page - 1) * per_page).limit(per_page).all()
    return {
        "products": [ProductResponse.model_validate(p).model_dump() for p in products],
        "total": total,
        "page": page,
        "per_page": per_page,
    }


@router.post("")
def create_product(
    data: ProductCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if user.role not in [UserRole.shop_owner, UserRole.admin]:
        raise HTTPException(403, "Only shop owners can create products")
    if data.price <= 0:
        raise HTTPException(400, "Price must be greater than zero")

    product = Product(
        shop_owner_id=user.id,
        name=data.name,
        description=data.description,
        price=data.price,
        image_url=data.image_url,
        category=data.category,
        stock_quantity=data.stock_quantity,
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return {"product": ProductResponse.model_validate(product).model_dump()}


@router.patch("/{product_id}")
def update_product(
    product_id: str,
    data: ProductUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(404, "Product not found")
    if product.shop_owner_id != user.id and user.role != UserRole.admin:
        raise HTTPException(403, "Not your product")

    if data.name is not None:
        product.name = data.name
    if data.description is not None:
        product.description = data.description
    if data.price is not None:
        product.price = data.price
    if data.image_url is not None:
        product.image_url = data.image_url
    if data.category is not None:
        product.category = data.category
    if data.stock_quantity is not None:
        product.stock_quantity = data.stock_quantity
    db.commit()
    return {"product": ProductResponse.model_validate(product).model_dump()}


@router.delete("/{product_id}")
def delete_product(
    product_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(404, "Product not found")
    if product.shop_owner_id != user.id and user.role != UserRole.admin:
        raise HTTPException(403, "Not your product")

    db.delete(product)
    db.commit()
    return {"success": True}
