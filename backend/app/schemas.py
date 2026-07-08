from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import datetime


class UserResponse(BaseModel):
    id: str
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    role: str
    token: str = ""


class SettingsResponse(BaseModel):
    low_stock_threshold: int


class SettingsUpdate(BaseModel):
    low_stock_threshold: int


class ProductCreate(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    image: Optional[str] = None
    category_id: str
    unit: str = "each"
    stock: int = 0
    discount_percent: int = 0

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
    image: Optional[str] = None
    category_id: Optional[str] = None
    unit: Optional[str] = None
    stock: Optional[int] = None
    discount_percent: Optional[int] = None

    @field_validator("price")
    @classmethod
    def price_must_be_positive(cls, v):
        if v is not None and v <= 0:
            raise ValueError("Price must be greater than zero")
        return v


class ProductVariantResponse(BaseModel):
    id: str
    product_id: str
    name: str
    price: Optional[float] = None
    stock: int = 0

    model_config = {"from_attributes": True}


class ProductVariantCreate(BaseModel):
    name: str
    price: Optional[float] = None
    stock: int = 0


class ProductVariantUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[float] = None
    stock: Optional[int] = None


class ProductResponse(BaseModel):
    id: str
    category_id: str
    name: str
    description: Optional[str] = None
    price: float
    unit: str
    image: Optional[str] = None
    stock: int
    discount_percent: int = 0
    is_deleted: bool = False
    created_at: datetime
    images: list = []
    variants: list = []

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
    address_id: str
    payment_method: str = "online"
    delivery_fee: float = 0


class OrderItemResponse(BaseModel):
    product_id: Optional[str] = None
    product_name: str
    quantity: int
    product_price: float
    subtotal: float
    product_image: str = ""

    model_config = {"from_attributes": True}


class OrderResponse(BaseModel):
    id: str
    status: str
    total_amount: float
    address_id: Optional[str] = None
    delivery_address: str = ""
    payment_method: str = ""
    delivery_fee: float = 0
    delivery_otp: Optional[str] = None
    created_at: datetime
    items: list[OrderItemResponse] = []

    model_config = {"from_attributes": True}


class OrderStatusUpdate(BaseModel):
    status: str


class PaymentVerify(BaseModel):
    payment_id: str
    signature: str


class UserRoleUpdate(BaseModel):
    role: str


class CartItemCreate(BaseModel):
    product_id: str
    quantity: int = 1


class CartItemUpdate(BaseModel):
    quantity: int

    @field_validator("quantity")
    @classmethod
    def quantity_must_be_positive(cls, v):
        if v <= 0:
            raise ValueError("Quantity must be greater than zero")
        return v


class CartItemResponse(BaseModel):
    id: str
    product_id: str
    product_name: str = ""
    product_price: float = 0
    product_image: str = ""
    product_unit: str = ""
    quantity: int
    subtotal: float = 0

    model_config = {"from_attributes": True}


class CartResponse(BaseModel):
    items: list[CartItemResponse] = []
    total: float = 0


class AddressCreate(BaseModel):
    label: str = "Home"
    address_type: str = "home"
    address_line1: str
    address_line2: Optional[str] = None
    house_number: Optional[str] = None
    floor_number: Optional[str] = None
    city: str
    state: str
    pincode: str
    landmark: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    is_default: bool = False


class AddressUpdate(BaseModel):
    label: Optional[str] = None
    address_type: Optional[str] = None
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    house_number: Optional[str] = None
    floor_number: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    landmark: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    is_default: Optional[bool] = None


class BannerResponse(BaseModel):
    id: str
    title: str
    subtitle: Optional[str] = None
    image_url: Optional[str] = None
    link: Optional[str] = None
    color: str = "from-[#FF9A3D] to-[#F26400]"
    is_active: bool = True
    sort_order: int = 0

    model_config = {"from_attributes": True}


class BannerCreate(BaseModel):
    title: str
    subtitle: Optional[str] = None
    image_url: Optional[str] = None
    link: Optional[str] = None
    color: str = "from-[#FF9A3D] to-[#F26400]"
    is_active: bool = True
    sort_order: int = 0


class BannerUpdate(BaseModel):
    title: Optional[str] = None
    subtitle: Optional[str] = None
    image_url: Optional[str] = None
    link: Optional[str] = None
    color: Optional[str] = None
    is_active: Optional[bool] = None
    sort_order: Optional[int] = None


class CategoryResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    image: Optional[str] = None

    model_config = {"from_attributes": True}


class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None


class NotificationResponse(BaseModel):
    id: str
    type: str
    title: str
    message: Optional[str] = None
    image_url: Optional[str] = None
    link: Optional[str] = None
    is_read: bool = False
    created_at: datetime

    model_config = {"from_attributes": True}


class PaymentCreate(BaseModel):
    amount: int
    currency: str = "INR"
