from app.models import Product
from app.services.order_service import get_recent_orders_by_phone


def build_product_context(db):
    products = db.query(Product).all()

    context = "Available Products:\n"

    for product in products:
        context += (
            f"- {product.name} "
            f"(₹{product.mrp})\n"
        )

    return context


def build_order_context(db, phone_number):
    """Live order status for the given phone number, for the assistant to
    answer "where is my order" / "did my payment go through" questions.
    Returns "" when there's no phone number or no matching orders.
    """
    if not phone_number:
        return ""

    orders = get_recent_orders_by_phone(db, phone_number)
    if not orders:
        return ""

    context = "Customer's recent orders:\n"
    for order in orders:
        context += (
            f"- Order #{order.id}: {order.quantity} x {order.product_name}, "
            f"total ₹{order.total_mrp}, payment {order.payment_status}, "
            f"fulfillment {order.status}\n"
        )

    return context
