from app.database import SessionLocal
from app.models import Product


def get_all_products():
    db = SessionLocal()
    products = db.query(Product).all()
    db.close()
    return products


def get_product_by_id(product_id: int):
    db = SessionLocal()
    product = db.query(Product).filter(Product.id == product_id).first()
    db.close()
    return product


def get_product_by_name(product_name: str):
    db = SessionLocal()
    product = db.query(Product).filter(Product.name.ilike(product_name)).first()
    db.close()
    return product