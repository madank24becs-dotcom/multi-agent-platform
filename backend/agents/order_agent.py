
# Order Agent
# Retrieves order information from mock business data

from data.mock_data import ORDERS


def get_order_details(order_id: str):
    """
    Retrieve order details using the given order ID.

    Args:
        order_id: The ID of the order to retrieve.

    Returns:
        Order details if found, otherwise None.
    """

    order = ORDERS.get(order_id)

    if order is None:
        return None

    return order