from app.models import Product


def build_product_context(db):
    products = db.query(Product).all()

    context = "Available Products:\n"

    for product in products:
        context += (
            f"- {product.name} "
            f"(₹{product.mrp})\n"
        )

    return context