# Zipra API

FastAPI backend for the Zipra grocery delivery platform.

## Tech Stack

- **Framework:** FastAPI (Python)
- **Database:** PostgreSQL (SQLAlchemy ORM + Alembic migrations)
- **Auth:** Firebase Admin SDK (token verification)
- **Payments:** Razorpay
- **Deployment:** Docker / Google Cloud Run / Render

## Prerequisites

- Python 3.11+
- PostgreSQL database
- Firebase project (service account)
- Razorpay account

## Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `RAZORPAY_KEY_ID` | Razorpay API key |
| `RAZORPAY_KEY_SECRET` | Razorpay API secret |
| `FIREBASE_CREDENTIALS` | Firebase service account JSON |
| `CORS_ORIGINS` | Allowed CORS origins (comma-separated) |
| `ENV` | `development` or `production` |

## Run

```bash
cd backend
alembic upgrade head
gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app --reload
```

## API Documentation

- Swagger UI: `/docs` (development only)
- ReDoc: `/redoc` (development only)

## API Endpoints

### Auth
- `POST /api/auth/verify-firebase` — Verify Firebase ID token, create/login user

### Products
- `GET /api/products` — List/search/filter products
- `GET /api/products/{id}` — Get product detail
- `POST /api/products` — Create product (shop_owner/admin)
- `PATCH /api/products/{id}` — Update product
- `DELETE /api/products/{id}` — Soft-delete product

### Categories
- `GET /api/categories` — List categories
- `POST /api/categories` — Create category
- `PATCH /api/categories/{id}` — Update category
- `DELETE /api/categories/{id}` — Delete category

### Cart
- `GET /api/cart` — Get user cart
- `POST /api/cart` — Add to cart
- `PUT /api/cart/{item_id}` — Update quantity
- `DELETE /api/cart/{item_id}` — Remove item
- `DELETE /api/cart` — Clear cart

### Orders
- `POST /api/orders` — Create order (with idempotency)
- `GET /api/orders` — Admin: list all orders
- `GET /api/orders/my` — User's orders
- `GET /api/orders/{id}` — Order detail
- `PATCH /api/orders/{id}/status` — Update order status
- `PATCH /api/orders/{id}/verify` — Verify payment

### Payments
- `POST /api/payments/create-order` — Create Razorpay order
- `POST /api/payments/verify` — Verify payment signature

### Addresses
- `GET /api/addresses` — List addresses
- `POST /api/addresses` — Create address
- `PUT /api/addresses/{id}` — Update address
- `DELETE /api/addresses/{id}` — Delete address

### Other
- `GET /api/banners` — List active banners
- `GET /api/wishlist` — List wishlist
- `POST /api/wishlist` — Add to wishlist
- `DELETE /api/wishlist/{product_id}` — Remove from wishlist
- `POST /api/coupons/validate` — Validate coupon code
- `GET /api/notifications` — List notifications
- `GET /api/delivery-zones` — List delivery zones
- `GET /api/delivery-zones/check` — Check if location is in zone
- `GET /api/admin/stats` — Dashboard statistics
- `GET /api/admin/users` — List users (admin)
- `GET /api/admin/settings` — Get settings
- `POST /api/upload` — Upload image
- `GET /api/config` — Public config (Razorpay key)
- `GET /api/geocode/reverse` — Reverse geocode
- `GET /api/geocode/search` — Forward geocode search
- `GET /health` — Health check

## Migrations

```bash
cd backend
alembic revision --autogenerate -m "description"
alembic upgrade head
```

## Docker

```bash
docker build -t zipra-api backend/
docker run -p 8080:8080 -e DATABASE_URL=... zipra-api
```
