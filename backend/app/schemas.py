from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import datetime


class UserResponse(BaseModel):
    id: str
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    role: str
    token: str


class ProductCreate(BaseModel):
    name: str
    description: str = ""
    price: float
    image_url: str = ""
    category: str = "General"
    stock_quantity: int = 0

    @field_validator("price")
    @classmethod
    def price_must_be_positive(cls, v):
        if v <= 0:
            raise ValueError("Price must be greater than zero")
        return v


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    image_url: Optional[str] = None
    category: Optional[str] = None
    stock_quantity: Optional[int] = None

    @field_validator("price")
    @classmethod
    def price_must_be_positive(cls, v):
        if v is not None and v <= 0:
            raise ValueError("Price must be greater than zero")
        return v


class ProductResponse(BaseModel):
    id: str
    name: str
    description: str
    price: float
    image_url: str
    category: str
    is_available: bool
    stock_quantity: int

    model_config = {"from_attributes": True}


class OrderItemCreate(BaseModel):
    product_id: str
    quantity: int

    @field_validator("quantity")
    @classmethod
    def quantity_must_be_positive(cls, v):
        if v <= 0:
            raise ValueError("Quantity must be greater than zero")
        return v


class OrderCreate(BaseModel):
    items: list[OrderItemCreate]
    delivery_address: str
    payment_method: str = "online"


class OrderItemResponse(BaseModel):
    product_id: Optional[str] = None
    product_name: str
    quantity: int
    price: float

    model_config = {"from_attributes": True}


class OrderResponse(BaseModel):
    id: str
    status: str
    total_amount: float
    delivery_address: str
    payment_id: str
    created_at: datetime
    items: list[OrderItemResponse]

    model_config = {"from_attributes": True}


class OrderStatusUpdate(BaseModel):
    status: str


class PaymentVerify(BaseModel):
    payment_id: str
    signature: str


class UserRoleUpdate(BaseModel):
    role: str
