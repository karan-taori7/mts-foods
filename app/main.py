import os

from dotenv import load_dotenv
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from anthropic import AsyncAnthropic
from app.services.chat_service import build_product_context

from app.database import get_db, engine
from app.models import Base, Order
from app.schemas import (
    ChatRequest,
    ChatResponse,
    OrderRequest,
    OrderStatusUpdate,
    ProductResponse,
    RegisterRequest,
    LoginRequest,
    TokenResponse,
    UserResponse,
)
from app.dependencies import get_current_user, get_current_admin
from app.services.auth_service import (
    get_user_by_email,
    create_user,
    verify_password,
    create_access_token,
)
from app.services.business_service import get_business_info
from app.services.product_service import (
    get_all_products,
    get_product_by_id,
)
from app.services.order_service import (
    create_order as create_order_service,
    get_all_orders,
)

load_dotenv()

Base.metadata.create_all(bind=engine)


def seed_products():
    from app.database import SessionLocal
    from app.models import Product
    from app.data import PRODUCTS
    db = SessionLocal()
    try:
        if db.query(Product).first() is None:
            db.bulk_insert_mappings(Product, PRODUCTS)
            db.commit()
    finally:
        db.close()


seed_products()

client = AsyncAnthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

app = FastAPI(title="MT's Foods API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", status_code=200)
async def root():
    return {"status": "MT's Foods API is running"}


@app.get(
    "/products",
    response_model=list[ProductResponse],
    status_code=200,
)
def get_products(db: Session = Depends(get_db)):
    return get_all_products(db)


@app.get(
    "/products/{product_id}",
    response_model=ProductResponse,
    status_code=200,
)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = get_product_by_id(db, product_id)

    if product is None:
        raise HTTPException(
            status_code=404,
            detail="Product not found",
        )

    return product


@app.post("/orders", status_code=201)
def create_order(order: OrderRequest, db: Session = Depends(get_db)):
    return create_order_service(db, order)


@app.get("/orders", status_code=200)
def get_orders(db: Session = Depends(get_db)):
    return get_all_orders(db)


@app.get("/business-info", status_code=200)
def business_info():
    return get_business_info()


@app.post("/chat", response_model=ChatResponse, status_code=200)
async def chat(req: ChatRequest, db: Session = Depends(get_db)):
    product_context = build_product_context(db)

    instructions = (
        "You are the friendly assistant for MT's Foods, "
        "a homemade papad business in Nagpur.\n\n"
        "Rules:\n"
        "- Answer in 2-4 short lines.\n"
        "- Do not use markdown, bold text, bullet symbols, or asterisks.\n"
        "- Use simple plain text only.\n"
        "- Mention prices only from the product list below.\n"
        "- If asked for products, suggest only 3-5 relevant products, not the full list.\n\n"
        "Product list from database:\n"
        f"{product_context}"
    )

    messages = [
        {
            "role": message.role,
            "content": message.content,
        }
        for message in req.messages
    ]

    response = await client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=500,
        system=instructions,
        messages=messages,
    )

    reply_text = response.content[0].text

    return ChatResponse(reply=reply_text)


# =========================
# Auth Routes
# =========================

@app.post("/auth/register", response_model=UserResponse, status_code=201)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    if get_user_by_email(db, req.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    return create_user(db, req.email, req.password)


@app.post("/auth/login", response_model=TokenResponse, status_code=200)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = get_user_by_email(db, req.email)
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token({"sub": str(user.id), "role": user.role})
    return TokenResponse(access_token=token)


@app.get("/auth/me", response_model=UserResponse, status_code=200)
def me(current_user=Depends(get_current_user)):
    return current_user


# =========================
# Admin Routes
# =========================

@app.get("/admin/orders", status_code=200)
def admin_get_orders(db: Session = Depends(get_db), _=Depends(get_current_admin)):
    return get_all_orders(db)


@app.patch("/admin/orders/{order_id}/status", status_code=200)
def update_order_status(
    order_id: int,
    body: OrderStatusUpdate,
    db: Session = Depends(get_db),
    _=Depends(get_current_admin),
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order.status = body.status
    db.commit()
    db.refresh(order)
    return order
