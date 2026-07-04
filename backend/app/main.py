from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import engine, Base
from .routes import auth, products, orders, admin

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Zipra API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(products.router, prefix="/api")
app.include_router(orders.router, prefix="/api")
app.include_router(admin.router, prefix="/api")


@app.get("/health")
def health():
    return {"status": "ok", "app": "Zipra API"}
