from pydantic import BaseModel, ConfigDict, Field


# =========================
# Chat Schemas
# =========================

class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    reply: str


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