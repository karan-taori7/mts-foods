import re
from pydantic import BaseModel, ConfigDict, Field, field_validator
from typing import Literal


# =========================
# Chat Schemas
# =========================


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1)


class ChatRequest(BaseModel):
    messages: list[ChatMessage] = Field(min_length=1)
    # Optional: lets the assistant look up this customer's live order
    # status alongside the product catalog.
    phone_number: str | None = None


class ChatResponse(BaseModel):
    reply: str


# =========================
# Admin Schemas
# =========================

class OrderStatusUpdate(BaseModel):
    status: str = Field(min_length=1)


# =========================
# Auth Schemas
# =========================

class RegisterRequest(BaseModel):
    email: str = Field(min_length=5)
    password: str = Field(min_length=6)


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: int
    email: str
    role: str

    model_config = ConfigDict(from_attributes=True)


# =========================
# Order Schemas
# =========================

class OrderRequest(BaseModel):
    customer_name: str = Field(min_length=2)
    phone_number: str = Field(min_length=10)
    product_name: str = Field(min_length=2)
    quantity: int = Field(gt=0)

    @field_validator("phone_number")
    @classmethod
    def validate_phone(cls, v):
        if not re.fullmatch(r"[6-9]\d{9}", v):
            raise ValueError("Must be a valid 10-digit Indian mobile number")
        return v


class OrderResponse(BaseModel):
    id: int
    customer_name: str
    phone_number: str
    product_name: str
    quantity: int
    total_mrp: int

    model_config = ConfigDict(
        from_attributes=True
    )


# =========================
# Payment Schemas
# =========================

class PaymentCreateRequest(BaseModel):
    customer_name: str = Field(min_length=2)
    phone_number: str = Field(min_length=10)
    product_name: str = Field(min_length=2)
    quantity: int = Field(gt=0)
    # Client-generated per-attempt key. Retrying this call with the same key
    # returns the existing Razorpay order instead of creating a new one.
    idempotency_key: str = Field(min_length=8, max_length=128)

    @field_validator("phone_number")
    @classmethod
    def validate_phone(cls, v):
        if not re.fullmatch(r"[6-9]\d{9}", v):
            raise ValueError("Must be a valid 10-digit Indian mobile number")
        return v


class PaymentVerifyRequest(BaseModel):
    razorpay_payment_id: str
    razorpay_order_id: str
    razorpay_signature: str
    customer_name: str
    phone_number: str
    product_name: str
    quantity: int


# =========================
# Product Schemas
# =========================

class ProductResponse(BaseModel):
    id: int
    name: str
    mrp: int

    model_config = ConfigDict(
        from_attributes=True
    )