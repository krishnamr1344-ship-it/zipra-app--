from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class UserCreate(BaseModel):
    name: str
    email: Optional[str] = None
    phone: str
    password: str
    role: str = "customer"


class UserLogin(BaseModel):
    email: str
    password: str


class PhoneOtpRequest(BaseModel):
    phone: str


class VerifyOtpRequest(BaseModel):
    phone: str
    otp: str


class UserResponse(BaseModel):
    id: str
    name: str
    email: Optional[str] = None
    phone: str
    role: str
    token: str


class ProductCreate(BaseModel):
    name: str
    description: str = ""
    price: float
    image_url: str = ""
    category: str = "General"


class ProductResponse(BaseModel):
    id: str
    name: str
    description: str
    price: float
    image_url: str
    category: str
    is_available: bool

    model_config = {"from_attributes": True}


class OrderItemCreate(BaseModel):
    product_id: str
    quantity: int
    price: float


class OrderCreate(BaseModel):
    items: list[OrderItemCreate]
    total_amount: float
    delivery_address: str
    payment_method: str = "online"


class OrderItemResponse(BaseModel):
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
    order_id: str
    signature: str


class UserRoleUpdate(BaseModel):
    role: str
