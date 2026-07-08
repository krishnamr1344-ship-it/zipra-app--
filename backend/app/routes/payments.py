import hashlib
import hmac
import logging

from fastapi import APIRouter, Depends, HTTPException
import razorpay

from .. import config
from ..database import get_db
from ..models import User
from ..schemas import PaymentCreate, PaymentVerify
from ..dependencies import get_current_user

logger = logging.getLogger("zipra.payments")

router = APIRouter(prefix="/payments", tags=["payments"])
razorpay_client = razorpay.Client(auth=(config.RAZORPAY_KEY_ID, config.RAZORPAY_KEY_SECRET))
razorpay_client.timeout = 10


@router.post("/create-order")
def create_payment_order(
    data: PaymentCreate,
    user: User = Depends(get_current_user),
):
    try:
        order = razorpay_client.order.create({
            "amount": data.amount,
            "currency": data.currency,
            "receipt": f"pay_{user.id}_{data.amount}",
        })
        return {
            "id": order["id"],
            "amount": order["amount"],
            "currency": order["currency"],
        }
    except Exception as e:
        logger.error("Razorpay order creation failed: %s", e)
        raise HTTPException(502, "Payment provider error")


@router.post("/verify")
def verify_payment(
    data: PaymentVerify,
):
    expected = hmac.new(
        config.RAZORPAY_KEY_SECRET.encode(),
        f"{data.payment_id}".encode(),
        hashlib.sha256,
    ).hexdigest()
    if not hmac.compare_digest(expected, data.signature):
        raise HTTPException(400, "Invalid payment signature")
    return {"success": True}
