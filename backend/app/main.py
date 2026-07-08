import json
import logging
import os
from pathlib import Path

import httpx
from fastapi import Depends, FastAPI, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response

from .database import get_db
from .dependencies import limiter
from .routes import auth, products, orders, admin, cart, wishlist, addresses, notifications, banners, categories, coupons, delivery_zones, payments, profile, admin_stats, upload
from .config import RAZORPAY_KEY_ID


class JSONFormatter(logging.Formatter):
    def format(self, record):
        log_entry = {
            "time": self.formatTime(record),
            "level": record.levelname,
            "name": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "func": record.funcName,
        }
        if record.exc_info and record.exc_info[0]:
            log_entry["exception"] = self.formatException(record.exc_info)
        return json.dumps(log_entry)


handler = logging.StreamHandler()
handler.setFormatter(JSONFormatter())
logging.basicConfig(level=logging.INFO, handlers=[handler])
logger = logging.getLogger("zipra")

env = os.getenv("ENV", "development")
app = FastAPI(
    title="Zipra API",
    version="1.0.0",
    docs_url=None if env == "production" else "/docs",
    redoc_url=None if env == "production" else "/redoc",
    openapi_url=None if env == "production" else "/openapi.json",
)

from .config import CORS_ORIGINS

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        if env == "production":
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        return response


app.add_middleware(SecurityHeadersMiddleware)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

app.include_router(auth.router, prefix="/api")
app.include_router(products.router, prefix="/api")
app.include_router(orders.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
app.include_router(cart.router, prefix="/api")
app.include_router(wishlist.router, prefix="/api")
app.include_router(addresses.router, prefix="/api")
app.include_router(notifications.router, prefix="/api")
app.include_router(banners.router, prefix="/api")
app.include_router(categories.router, prefix="/api")
app.include_router(payments.router, prefix="/api")
app.include_router(profile.router, prefix="/api")
app.include_router(admin_stats.router, prefix="/api")
app.include_router(coupons.router, prefix="/api")
app.include_router(delivery_zones.router, prefix="/api")
app.include_router(upload.router, prefix="/api")


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled exception on %s %s", request.method, request.url.path)
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})


@app.get("/api/config")
def public_config():
    return {"razorpay_key": RAZORPAY_KEY_ID}


NOMINATIM_BASE = "https://nominatim.openstreetmap.org"
NOMINATIM_HEADERS = {"User-Agent": "ZipraApp/1.0 (support@zipra.app)"}


@app.get("/api/geocode/reverse")
async def geocode_reverse(lat: float = Query(...), lon: float = Query(...)):
    async with httpx.AsyncClient() as client:
        res = await client.get(
            f"{NOMINATIM_BASE}/reverse",
            params={"lat": lat, "lon": lon, "format": "json", "addressdetails": 1, "limit": 1},
            headers=NOMINATIM_HEADERS,
            timeout=10,
        )
        if res.status_code != 200:
            return JSONResponse(status_code=502, content={"detail": "Geocode failed"})
        return res.json()


@app.get("/api/geocode/search")
async def geocode_search(q: str = Query(...), limit: int = Query(6, le=10)):
    async with httpx.AsyncClient() as client:
        res = await client.get(
            f"{NOMINATIM_BASE}/search",
            params={"q": q, "format": "json", "addressdetails": 1, "limit": limit, "countrycodes": "in"},
            headers=NOMINATIM_HEADERS,
            timeout=10,
        )
        if res.status_code != 200:
            return JSONResponse(status_code=502, content={"detail": "Search failed"})
        return res.json()


@app.get("/health")
def health(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        db_ok = True
    except Exception:
        db_ok = False
    status = "ok" if db_ok else "degraded"
    code = 200 if db_ok else 503
    return JSONResponse(status_code=code, content={"status": status, "app": "Zipra API", "database": "connected" if db_ok else "down"})


STATIC_DIR = Path(__file__).resolve().parent.parent / "static"

if STATIC_DIR.exists():

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        file_path = STATIC_DIR / full_path
        if file_path.is_file():
            return FileResponse(str(file_path))
        index = STATIC_DIR / "index.html"
        if index.exists():
            return FileResponse(str(index), media_type="text/html")
        return JSONResponse(status_code=404, content={"detail": "Not found"})
