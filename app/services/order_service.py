from fastapi import HTTPException
from app.models import Order
from app.services.product_service import get_product_by_name


def create_order(db, order):
    product = get_product_by_name(db, order.product_name)

    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")

    total_price = product.mrp * order.quantity

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

    return {
        "message": "Order received",
        "order_id": new_order.id,
        "customer_name": new_order.customer_name,
        "phone_number": new_order.phone_number,
        "product": new_order.product_name,
        "quantity": new_order.quantity,
        "total_mrp": new_order.total_mrp,
    }


def get_all_orders(db):
    orders = db.query(Order).all()
    return orders


def get_order_by_idempotency_key(db, idempotency_key):
    return db.query(Order).filter(Order.idempotency_key == idempotency_key).first()


def get_order_by_razorpay_order_id(db, razorpay_order_id):
    return db.query(Order).filter(Order.razorpay_order_id == razorpay_order_id).first()


def get_recent_orders_by_phone(db, phone_number, limit=5):
    return (
        db.query(Order)
        .filter(Order.phone_number == phone_number)
        .order_by(Order.created_at.desc())
        .limit(limit)
        .all()
    )