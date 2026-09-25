
# Notification Agent
# Generates mock customer refund notifications
# No real email is sent

def generate_refund_notification(customer: dict, refund: dict):
    """Generate a refund notification for the customer."""

    # Check whether customer information exists
    if customer is None:
        return {
            "success": False,
            "message": "Customer not found"
        }

    # Check whether refund was successful
    if not refund or not refund.get("success"):
        return {
            "success": False,
            "message": "No successful refund to notify"
        }

    # Create mock notification message
    message = (
        f"Hello {customer['name']}, "
        f"your refund for order {refund['order_id']} "
        f"has been initiated. "
        f"Refund ID: {refund['refund_id']}. "
        f"Amount: Rs. {refund['amount']}. "
        f"Status: {refund['status']}."
    )

    return {
        "success": True,
        "recipient": customer["email"],
        "subject": "Your Refund Has Been Initiated",
        "message": message,
        "channel": "Mock Email",
        "sent": False
    }