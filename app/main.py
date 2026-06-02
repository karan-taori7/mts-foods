import os

from dotenv import load_dotenv
from fastapi import FastAPI
from pydantic import BaseModel
from anthropic import AsyncAnthropic
from app.services.business_service import get_business_info
from app.services.order_service import (
    create_order as create_order_service,
    get_all_orders,
)

from app.services.product_service import (
    get_all_products,
    get_product_by_id,
    get_product_by_name,
)

from app.services.order_service import (
    create_order as create_order_service,
    get_all_orders,
)
from fastapi.middleware.cors import CORSMiddleware

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


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    reply: str


class OrderRequest(BaseModel):
    customer_name: str
    phone_number: str
    product_name: str
    quantity: int


@app.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    instructions = (
        "You are the friendly assistant for MT's Foods, "
        "a homemade papad, achar, and katran business in Nagpur. "
        "Answer customer questions warmly and concisely."
    )

    customer_message = {"role": "user", "content": req.message}

    response = await client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=500,
        system=instructions,
        messages=[customer_message],
    )

    reply_text = response.content[0].text
    return ChatResponse(reply=reply_text)


@app.get("/")
async def root():
    return {"status": "MT's Foods API is running"}


@app.get("/products")
def get_products():
    return get_all_products()


@app.get("/products/{product_id}")
def get_product(product_id: int):
    product = get_product_by_id(product_id)

    if product is None:
        return {"error": "Product not found"}

    return product


@app.post("/orders")
def create_order(order: OrderRequest):
    result= create_order_service(order)
    return result

@app.get("/orders")
def get_orders():
    return get_all_orders()

@app.get("/business-info")
def business_info():
    return get_business_info()
    
