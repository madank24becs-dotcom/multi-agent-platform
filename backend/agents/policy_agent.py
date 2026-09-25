
from data.mock_data import REFUND_POLICY


def check_refund_eligibility(order: dict):
    """Check whether an order qualifies for a refund."""

    # Check if the order exists
    if order is None:
        return {
            "eligible": False,
            "reason": "Order not found"
        }

    # Check delivery status
    if (
        REFUND_POLICY["require_delivered_order"]
        and order["status"] != "Delivered"
    ):
        return {
            "eligible": False,
            "reason": "Order has not been delivered"
        }

    # Check refund time window
    if (
        order["days_since_delivery"]
        > REFUND_POLICY["refund_window_days"]
    ):
        return {
            "eligible": False,
            "reason": "Refund window has expired"
        }

    # Check product condition
    if order["condition"] not in REFUND_POLICY["eligible_conditions"]:
        return {
            "eligible": False,
            "reason": f"Condition '{order['condition']}' is not eligible"
        }

    # All checks passed
    return {
        "eligible": True,
        "reason": "Order meets refund policy requirements"
    }