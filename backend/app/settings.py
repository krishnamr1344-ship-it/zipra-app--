"""Helpers for reading/writing key-value application settings stored in the
`settings` table. Used for admin-configurable values such as the low-stock
alert threshold."""

from sqlalchemy.orm import Session

from .models import Setting

DEFAULT_LOW_STOCK_THRESHOLD = 5
LOW_STOCK_THRESHOLD_KEY = "low_stock_threshold"


def get_low_stock_threshold(db: Session) -> int:
    row = (
        db.query(Setting)
        .filter(Setting.key == LOW_STOCK_THRESHOLD_KEY)
        .first()
    )
    if row and row.value is not None:
        try:
            return int(row.value)
        except (TypeError, ValueError):
            return DEFAULT_LOW_STOCK_THRESHOLD
    return DEFAULT_LOW_STOCK_THRESHOLD


def set_low_stock_threshold(db: Session, value: int) -> int:
    value = max(0, int(value))
    row = (
        db.query(Setting)
        .filter(Setting.key == LOW_STOCK_THRESHOLD_KEY)
        .first()
    )
    if row:
        row.value = str(value)
    else:
        row = Setting(key=LOW_STOCK_THRESHOLD_KEY, value=str(value))
        db.add(row)
    db.commit()
    db.refresh(row)
    return value
