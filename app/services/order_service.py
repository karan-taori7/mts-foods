from app.database import SessionLocal
from app.models import Order
from app.services.product_service import get_product_by_name


def create_order(order):
    product = get_product_by_name(order.product_name)

    if product is None:
        return {"error": "Product not found"}

    total_price = product.mrp * order.quantity

    db = SessionLocal()

    new_order = Order(
        customer_name=order.customer_name,
        phone_number=order.phone_number,
        product_name=product.name,
        quantity=order.quantity,
        total_mrp=total_price,
    )

    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    db.close()

    return {
        "message": "Order received",
        "order_id": new_order.id,
        "customer_name": new_order.customer_name,
        "phone_number": new_order.phone_number,
        "product": new_order.product_name,
        "quantity": new_order.quantity,
        "total_mrp": new_order.total_mrp,
    }


def get_all_orders():
    db = SessionLocal()

    orders = db.query(Order).all()

    db.close()

    return orders