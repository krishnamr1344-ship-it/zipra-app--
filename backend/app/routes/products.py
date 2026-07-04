from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Product, User, UserRole
from ..schemas import ProductCreate, ProductResponse
from ..dependencies import get_current_user

router = APIRouter(prefix="/products", tags=["products"])


@router.get("")
def list_products(
    category: str = "",
    db: Session = Depends(get_db),
):
    query = db.query(Product).filter(Product.is_available == True)
    if category:
        query = query.filter(Product.category == category)
    products = query.order_by(Product.created_at.desc()).all()
    return {"products": [ProductResponse.model_validate(p).model_dump() for p in products]}


@router.post("")
def create_product(
    data: ProductCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if user.role not in [UserRole.shop_owner, UserRole.admin]:
        raise HTTPException(403, "Only shop owners can create products")

    product = Product(
        shop_owner_id=user.id,
        name=data.name,
        description=data.description,
        price=data.price,
        image_url=data.image_url,
        category=data.category,
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return {"product": ProductResponse.model_validate(product).model_dump()}


@router.put("/{product_id}")
def update_product(
    product_id: str,
    data: ProductCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(404, "Product not found")
    if product.shop_owner_id != user.id and user.role != UserRole.admin:
        raise HTTPException(403, "Not your product")

    for key, val in data.model_dump().items():
        setattr(product, key, val)
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
