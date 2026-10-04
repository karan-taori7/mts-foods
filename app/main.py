import hmac
import hashlib
import os

import razorpay
from dotenv import load_dotenv
from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from anthropic import AsyncAnthropic
from app.services.chat_service import build_order_context, build_product_context

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
    PaymentCreateRequest,
    PaymentVerifyRequest,
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
    get_product_by_name,
)
from app.services.order_service import (
    create_order as create_order_service,
    get_all_orders,
    get_order_by_idempotency_key,
    get_order_by_razorpay_order_id,
)

load_dotenv()

Base.metadata.create_all(bind=engine)

RAZORPAY_KEY_ID = os.environ["RAZORPAY_KEY_ID"]
RAZORPAY_KEY_SECRET = os.environ["RAZORPAY_KEY_SECRET"]
# Optional until webhook reconciliation is configured in the Razorpay
# dashboard — the app must still boot without it.
RAZORPAY_WEBHOOK_SECRET = os.environ.get("RAZORPAY_WEBHOOK_SECRET")


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

anthropic_client = AsyncAnthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

app = FastAPI(title="MT's Foods API")

_origins_raw = os.environ.get("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost")
_allowed_origins = [o.strip() for o in _origins_raw.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
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


@app.get("/business-info", status_code=200)
def business_info():
    return get_business_info()


@app.post("/chat", response_model=ChatResponse, status_code=200)
async def chat(req: ChatRequest, db: Session = Depends(get_db)):
    product_context = build_product_context(db)
    order_context = build_order_context(db, req.phone_number)

    instructions = (
        "You are the friendly assistant for MT's Foods, "
        "a homemade papad business.\n\n"
        "Rules:\n"
        "- Answer in 2-4 short lines.\n"
        "- Do not use markdown, bold text, bullet symbols, or asterisks.\n"
        "- Use simple plain text only.\n"
        "- Mention prices only from the product list below.\n"
        "- If asked for products, suggest only 3-5 relevant products, not the full list.\n"
        "- If the customer asks about an order or payment, answer using the "
        "order list below; if it's empty, say you don't see an order for "
        "their number yet.\n\n"
        "Product list from database:\n"
        f"{product_context}\n"
        f"{order_context}"
    )

    messages = [
        {
            "role": message.role,
            "content": message.content,
        }
        for message in req.messages
    ]

    response = await anthropic_client.messages.create(
        model="claude-haiku-4-5-20251001",
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
# Payment Routes
# =========================

@app.post("/payment/create-order", status_code=200)
def payment_create_order(req: PaymentCreateRequest, db: Session = Depends(get_db)):
    # Idempotency: a retried request with the same key (e.g. a network
    # timeout retry, or a double form submit) returns the order already
    # created for it instead of opening a second Razorpay order.
    existing = get_order_by_idempotency_key(db, req.idempotency_key)
    if existing is not None:
        return {
            "razorpay_order_id": existing.razorpay_order_id,
            "amount": existing.total_mrp * 100,
            "currency": "INR",
            "key_id": RAZORPAY_KEY_ID,
        }

    product = get_product_by_name(db, req.product_name)
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")

    total_price = product.mrp * req.quantity
    total_paise = total_price * 100

    rz_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
    rz_order = rz_client.order.create({
        "amount": total_paise,
        "currency": "INR",
        "receipt": f"mts_{req.phone_number}",
    })

    # Create the order row now, in a pending state, keyed by the Razorpay
    # order id — /payment/verify and the webhook both reconcile onto this
    # same row rather than inserting a new one.
    order = Order(
        customer_name=req.customer_name,
        phone_number=req.phone_number,
        product_name=product.name,
        quantity=req.quantity,
        total_mrp=total_price,
        payment_status="created",
        razorpay_order_id=rz_order["id"],
        idempotency_key=req.idempotency_key,
    )
    db.add(order)
    db.commit()

    return {
        "razorpay_order_id": rz_order["id"],
        "amount": rz_order["amount"],
        "currency": rz_order["currency"],
        "key_id": RAZORPAY_KEY_ID,
    }


@app.post("/payment/verify", status_code=201)
def payment_verify(req: PaymentVerifyRequest, db: Session = Depends(get_db)):
    order = get_order_by_razorpay_order_id(db, req.razorpay_order_id)
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")

    # Idempotent: if this order was already reconciled (by this endpoint
    # being called twice, or by the webhook beating us to it), don't
    # re-verify or double-write — just confirm success.
    if order.payment_status == "paid":
        return {"message": "Payment verified and order placed", "order_id": order.id}

    msg = f"{req.razorpay_order_id}|{req.razorpay_payment_id}"
    generated = hmac.new(
        RAZORPAY_KEY_SECRET.encode(),
        msg.encode(),
        hashlib.sha256,
    ).hexdigest()

    if not hmac.compare_digest(generated, req.razorpay_signature):
        raise HTTPException(status_code=400, detail="Invalid payment signature")

    order.payment_status = "paid"
    order.razorpay_payment_id = req.razorpay_payment_id
    db.commit()

    return {"message": "Payment verified and order placed", "order_id": order.id}


@app.post("/payment/webhook", status_code=200)
async def payment_webhook(request: Request, db: Session = Depends(get_db)):
    """Server-to-server reconciliation path. Catches payments that the
    browser-side /payment/verify call never reported — e.g. the customer
    closed the tab right after paying, or the verify call failed to reach
    us — so a captured payment is never silently missed.
    """
    if not RAZORPAY_WEBHOOK_SECRET:
        raise HTTPException(status_code=503, detail="Webhook not configured")

    body = await request.body()
    signature = request.headers.get("X-Razorpay-Signature", "")

    generated = hmac.new(
        RAZORPAY_WEBHOOK_SECRET.encode(),
        body,
        hashlib.sha256,
    ).hexdigest()

    if not hmac.compare_digest(generated, signature):
        raise HTTPException(status_code=400, detail="Invalid webhook signature")

    payload = await request.json()
    event = payload.get("event")
    payment_entity = payload.get("payload", {}).get("payment", {}).get("entity", {})
    razorpay_order_id = payment_entity.get("order_id")

    if not razorpay_order_id:
        return {"status": "ignored"}

    order = get_order_by_razorpay_order_id(db, razorpay_order_id)
    if order is None:
        return {"status": "ignored"}

    if event == "payment.captured" and order.payment_status != "paid":
        order.payment_status = "paid"
        order.razorpay_payment_id = payment_entity.get("id")
        db.commit()
    elif event == "payment.failed" and order.payment_status not in ("paid", "failed"):
        order.payment_status = "failed"
        db.commit()

    return {"status": "ok"}


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
