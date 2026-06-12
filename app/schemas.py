from pydantic import BaseModel, ConfigDict, Field
from typing import Literal


# =========================
# Chat Schemas
# =========================


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1)


class ChatRequest(BaseModel):
    messages: list[ChatMessage] = Field(min_length=1)


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
# Product Schemas
# =========================

class ProductResponse(BaseModel):
    id: int
    name: str
    mrp: int

    model_config = ConfigDict(
        from_attributes=True
    )