
# Customer Agent
# Retrieves customer information from mock data

from data.mock_data import CUSTOMERS


def get_customer_details(customer_id: str):
    """Retrieve customer details using customer ID."""

    customer = CUSTOMERS.get(customer_id)

    if customer is None:
        return None

    return customer