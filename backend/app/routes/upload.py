import logging
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, Request, UploadFile
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User
from ..dependencies import get_current_user

logger = logging.getLogger("zipra.upload")

router = APIRouter(prefix="/upload", tags=["upload"])

UPLOAD_DIR = Path(__file__).resolve().parent.parent.parent / "static" / "uploads"
ALLOWED_EXT = {".png", ".jpg", ".jpeg", ".webp", ".gif"}
MAX_SIZE = 5 * 1024 * 1024  # 5 MB

UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


@router.post("")
async def upload_image(
    request: Request,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if user.role not in ("shop_owner", "admin"):
        raise HTTPException(403, "Only shop staff can upload images")

    ext = Path(file.filename or "").suffix.lower()
    if ext not in ALLOWED_EXT:
        raise HTTPException(400, "Unsupported file type. Use png, jpg, jpeg, webp or gif.")

    data = await file.read()
    if len(data) > MAX_SIZE:
        raise HTTPException(400, "File too large (max 5 MB).")

    filename = f"{uuid.uuid4().hex}{ext}"
    (UPLOAD_DIR / filename).write_bytes(data)

    base = str(request.base_url).rstrip("/")
    url = f"{base}/uploads/{filename}"
    logger.info("Image uploaded: %s", filename)
    return {"url": url, "filename": filename}
