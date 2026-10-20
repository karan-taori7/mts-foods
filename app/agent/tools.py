"""Tool definitions for the chat agent, plus their execution.

Each tool is backed by the same service functions the REST and gRPC APIs
use — the agent isn't a separate code path to the data, just a different
caller of it.
"""

from app.services.order_service import get_recent_orders_by_phone
from app.services.product_service import get_all_products

TOOLS = [
    {
        "name": "list_products",
        "description": (
            "List MT's Foods products currently in the catalog, with their "
            "prices in INR. Call this before answering any question about "
            "what's available or how much something costs — never guess a "
            "product or price from memory."
        ),
        "input_schema": {"type": "object", "properties": {}, "required": []},
    },
    {
        "name": "get_order_status",
        "description": (
            "Look up a customer's recent orders by phone number, including "
            "payment status (created/paid/failed) and fulfillment status. "
            "Call this whenever the customer asks about an order, delivery, "
            "or payment — never guess an order's status."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "phone_number": {
                    "type": "string",
                    "description": "The customer's 10-digit phone number.",
                }
            },
            "required": ["phone_number"],
        },
    },
]


def execute_tool(db, name: str, tool_input: dict):
    if name == "list_products":
        return [{"name": p.name, "mrp": p.mrp} for p in get_all_products(db)]

    if name == "get_order_status":
        phone = tool_input.get("phone_number", "")
        orders = get_recent_orders_by_phone(db, phone)
        return [
            {
                "order_id": o.id,
                "product_name": o.product_name,
                "quantity": o.quantity,
                "total_mrp": o.total_mrp,
                "payment_status": o.payment_status,
                "status": o.status,
            }
            for o in orders
        ]

    return {"error": f"unknown tool: {name}"}
