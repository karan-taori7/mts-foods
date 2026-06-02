from sqlalchemy import Column, Integer, Text, TIMESTAMP
from sqlalchemy.sql import func

from app.database import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(Text, nullable=False)
    mrp = Column(Integer, nullable=False)


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    customer_name = Column(Text, nullable=False)
    phone_number = Column(Text, nullable=False)
    product_name = Column(Text, nullable=False)
    quantity = Column(Integer, nullable=False)
    total_mrp = Column(Integer, nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())