import logging

from fastapi import APIRouter, HTTPException

logger = logging.getLogger("zipra.coupons")

router = APIRouter(prefix="/coupons", tags=["coupons"])


STATIC_COUPONS = {
    "WELCOME10": {"discount_percent": 10, "min_order": 0},
    "SAVE20": {"discount_percent": 20, "min_order": 500},
    "FIRST": {"discount_percent": 15, "min_order": 200},
}


@router.post("/validate")
def validate_coupon(data: dict):
    code = data.get("code", "").strip().upper()
    cart_total = data.get("cart_total", 0)

    if not code:
        raise HTTPException(400, "Coupon code is required")

    coupon = STATIC_COUPONS.get(code)
    if not coupon:
        raise HTTPException(404, f"Coupon '{code}' not found")

    if cart_total < coupon["min_order"]:
        raise HTTPException(
            400,
            f"Minimum order of ₹{coupon['min_order']} required for this coupon",
        )

    return {
        "valid": True,
        "code": code,
        "discount_percent": coupon["discount_percent"],
    }
