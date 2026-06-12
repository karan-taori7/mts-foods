from sqlalchemy import Column, Integer, Text, TIMESTAMP, ForeignKey
from sqlalchemy.sql import func

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(Text, unique=True, nullable=False, index=True)
    hashed_password = Column(Text, nullable=False)
    role = Column(Text, nullable=False, default="customer")
    created_at = Column(TIMESTAMP, server_default=func.now())


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(Text, nullable=False)
    mrp = Column(Integer, nullable=False)


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    customer_name = Column(Text, nullable=False)
    phone_number = Column(Text, nullable=False)
    product_name = Column(Text, nullable=False)
    quantity = Column(Integer, nullable=False)
    total_mrp = Column(Integer, nullable=False)
    status = Column(Text, nullable=False, default="pending")
    created_at = Column(TIMESTAMP, server_default=func.now())