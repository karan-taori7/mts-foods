"""gRPC server for MT's Foods — runs as its own process/Deployment
alongside the REST API (same database, same codebase, different port).

Run with: python -m app.rpc.server
"""

import logging
import os
from concurrent import futures

import grpc
from dotenv import load_dotenv

from app.database import SessionLocal
from app.rpc import commerce_pb2, commerce_pb2_grpc
from app.services.order_service import get_recent_orders_by_phone
from app.services.product_service import get_all_products, get_product_by_id

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("grpc-server")

GRPC_PORT = os.environ.get("GRPC_PORT", "50051")


class CommerceService(commerce_pb2_grpc.CommerceServiceServicer):
    def ListProducts(self, request, context):
        db = SessionLocal()
        try:
            products = get_all_products(db)
            return commerce_pb2.ProductListReply(
                products=[
                    commerce_pb2.ProductReply(id=p.id, name=p.name, mrp=p.mrp)
                    for p in products
                ]
            )
        finally:
            db.close()

    def GetProduct(self, request, context):
        db = SessionLocal()
        try:
            product = get_product_by_id(db, request.id)
            if product is None:
                context.set_code(grpc.StatusCode.NOT_FOUND)
                context.set_details(f"Product {request.id} not found")
                return commerce_pb2.ProductReply()
            return commerce_pb2.ProductReply(
                id=product.id, name=product.name, mrp=product.mrp
            )
        finally:
            db.close()

    def GetOrderStatus(self, request, context):
        db = SessionLocal()
        try:
            orders = get_recent_orders_by_phone(db, request.phone_number)
            return commerce_pb2.OrderStatusReply(
                orders=[
                    commerce_pb2.OrderStatusReply.Order(
                        id=o.id,
                        product_name=o.product_name,
                        quantity=o.quantity,
                        total_mrp=o.total_mrp,
                        payment_status=o.payment_status,
                        status=o.status,
                    )
                    for o in orders
                ]
            )
        finally:
            db.close()


def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    commerce_pb2_grpc.add_CommerceServiceServicer_to_server(
        CommerceService(), server
    )
    server.add_insecure_port(f"[::]:{GRPC_PORT}")
    server.start()
    logger.info(f"gRPC server listening on port {GRPC_PORT}")
    server.wait_for_termination()


if __name__ == "__main__":
    serve()
