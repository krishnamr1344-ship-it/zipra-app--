from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session, selectinload

from ..database import get_db
from ..models import Product, ProductVariant, User, UserRole
from ..schemas import (
    ProductCreate,
    ProductUpdate,
    ProductResponse,
    ProductVariantCreate,
    ProductVariantUpdate,
    ProductVariantResponse,
)
from ..dependencies import get_current_user

router = APIRouter(prefix="/products", tags=["products"])


def _variant_to_dict(v: ProductVariant) -> dict:
    return ProductVariantResponse(
        id=str(v.id),
        product_id=str(v.product_id),
        name=v.name,
        price=float(v.price) if v.price is not None else None,
        stock=v.stock,
    ).model_dump()


def product_to_dict(p: Product) -> dict:
    images_list = [{"image_url": img.image_url, "sort_order": img.sort_order} for img in p.images] if p.images else []
    variants_list = (
        [_variant_to_dict(v) for v in p.variants if not v.is_deleted]
        if p.variants else []
    )
    return ProductResponse(
        id=str(p.id),
        category_id=str(p.category_id),
        name=p.name,
        description=p.description,
        price=float(p.price),
        unit=p.unit,
        image=p.image,
        stock=p.stock,
        discount_percent=p.discount_percent,
        is_deleted=p.is_deleted,
        created_at=p.created_at,
        images=images_list,
        variants=variants_list,
    ).model_dump()


@router.get("/{product_id}")
def get_product(
    product_id: str,
    db: Session = Depends(get_db),
):
    product = db.query(Product).options(selectinload(Product.images), selectinload(Product.variants)).filter(Product.id == product_id, Product.is_deleted == False).first()
    if not product:
        raise HTTPException(404, "Product not found")
    return product_to_dict(product)


@router.get("")
def list_products(
    search: str = "",
    category_id: str = "",
    sort_by: str = "",
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    limit: int = Query(0, ge=0, le=100),
    db: Session = Depends(get_db),
):
    query = db.query(Product).options(selectinload(Product.images), selectinload(Product.variants)).filter(Product.is_deleted == False)

    if search:
        query = query.filter(
            or_(
                Product.name.ilike(f"%{search}%"),
                Product.description.ilike(f"%{search}%"),
            )
        )

    if category_id:
        query = query.filter(Product.category_id == category_id)

    if sort_by == "price_asc":
        query = query.order_by(Product.price.asc())
    elif sort_by == "price_desc":
        query = query.order_by(Product.price.desc())
    elif sort_by == "rating":
        query = query.order_by(Product.created_at.desc())
    elif sort_by == "popular":
        query = query.order_by(Product.stock.desc())
    else:
        query = query.order_by(Product.created_at.desc())

    if limit > 0:
        per_page = limit

    total = query.count()
    products = query.offset((page - 1) * per_page).limit(per_page).all()
    return {
        "products": [product_to_dict(p) for p in products],
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
    if user.role not in ("shop_owner", "admin"):
        raise HTTPException(403, "Only shop owners can create products")

    product = Product(
        name=data.name,
        description=data.description,
        price=data.price,
        image=data.image,
        category_id=data.category_id,
        unit=data.unit,
        stock=data.stock,
        discount_percent=data.discount_percent,
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return {"product": product_to_dict(product)}


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
    if user.role not in ("shop_owner", "admin"):
        raise HTTPException(403, "Not authorized")

    for key in ("name", "description", "price", "image", "category_id", "unit", "stock", "discount_percent"):
        val = getattr(data, key, None)
        if val is not None:
            setattr(product, key, val)
    db.commit()
    return {"product": product_to_dict(product)}


@router.delete("/{product_id}")
def delete_product(
    product_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(404, "Product not found")
    if user.role not in ("shop_owner", "admin"):
        raise HTTPException(403, "Not authorized")
    product.is_deleted = True
    db.commit()
    return {"success": True}


def _require_seller(user: User):
    if user.role not in ("shop_owner", "admin"):
        raise HTTPException(403, "Not authorized")


@router.post("/{product_id}/variants")
def create_variant(
    product_id: str,
    data: ProductVariantCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    _require_seller(user)
    product = db.query(Product).filter(Product.id == product_id, Product.is_deleted == False).first()
    if not product:
        raise HTTPException(404, "Product not found")
    variant = ProductVariant(
        product_id=product.id,
        name=data.name,
        price=data.price,
        stock=data.stock,
    )
    db.add(variant)
    db.commit()
    db.refresh(variant)
    return {"variant": _variant_to_dict(variant)}


@router.patch("/{product_id}/variants/{variant_id}")
def update_variant(
    product_id: str,
    variant_id: str,
    data: ProductVariantUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    _require_seller(user)
    variant = (
        db.query(ProductVariant)
        .filter(ProductVariant.id == variant_id, ProductVariant.product_id == product_id)
        .first()
    )
    if not variant:
        raise HTTPException(404, "Variant not found")
    for key in ("name", "price", "stock"):
        val = getattr(data, key, None)
        if val is not None:
            setattr(variant, key, val)
    db.commit()
    return {"variant": _variant_to_dict(variant)}


@router.delete("/{product_id}/variants/{variant_id}")
def delete_variant(
    product_id: str,
    variant_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    _require_seller(user)
    variant = (
        db.query(ProductVariant)
        .filter(ProductVariant.id == variant_id, ProductVariant.product_id == product_id)
        .first()
    )
    if not variant:
        raise HTTPException(404, "Variant not found")
    variant.is_deleted = True
    db.commit()
    return {"success": True}
