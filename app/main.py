import os

from dotenv import load_dotenv
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from anthropic import AsyncAnthropic
from app.services.chat_service import build_product_context

from app.database import get_db
from app.schemas import (
    ChatRequest,
    ChatResponse,
    OrderRequest,
    ProductResponse,
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

client = AsyncAnthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

app = FastAPI(title="MT's Foods API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
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

    customer_message = {
        "role": "user",
        "content": req.message,
    }

    response = await client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=500,
        system=instructions,
        messages=[customer_message],
    )

    reply_text = response.content[0].text

    return ChatResponse(reply=reply_text)