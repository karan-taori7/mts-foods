from app.models import Product


def get_all_products(db):
    products = db.query(Product).all()
    return products


def get_product_by_id(db, product_id: int):
    product = db.query(Product).filter(Product.id == product_id).first()
    return product


def get_product_by_name(db, product_name: str):
    product = db.query(Product).filter(Product.name.ilike(product_name)).first()
    return product