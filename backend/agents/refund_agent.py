
# Refund Agent
# Simulates processing a refund using mock data

from uuid import uuid4


def process_refund(order: dict, eligibility_result: dict):
    """Process a mock refund if the order is eligible."""

    # Check if the order exists
    if order is None:
        return {
            "success": False,
            "message": "Order not found"
        }

    # Check policy eligibility
    if not eligibility_result["eligible"]:
        return {
            "success": False,
            "message": eligibility_result["reason"]
        }

    # Generate a mock refund ID
    refund_id = "REF" + uuid4().hex[:6].upper()

    # Simulate refund processing (no real payment is made)
    return {
        "success": True,
        "refund_id": refund_id,
        "order_id": order["order_id"],
        "customer_id": order["customer_id"],
        "product": order["product"],
        "amount": order["price"],
        "status": "Refund Initiated",
        "message": "Mock refund processed successfully"
    }