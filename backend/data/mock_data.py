
# Mock customer data
CUSTOMERS = {
    "C101": {
        "customer_id": "C101",
        "name": "Rahul Sharma",
        "email": "rahul@example.com"
    },
    "C102": {
        "customer_id": "C102",
        "name": "Priya Singh",
        "email": "priya@example.com"
    }
}


# Mock order data
ORDERS = {
    "ORD123": {
        "order_id": "ORD123",
        "customer_id": "C101",
        "product": "Wireless Headphones",
        "price": 2499,
        "status": "Delivered",
        "days_since_delivery": 5,
        "condition": "Damaged"
    },
    "ORD124": {
        "order_id": "ORD124",
        "customer_id": "C102",
        "product": "Smart Watch",
        "price": 3999,
        "status": "Delivered",
        "days_since_delivery": 10,
        "condition": "Good"
    }
}


# Mock refund policy
REFUND_POLICY = {
    "refund_window_days": 30,
    "eligible_conditions": ["Damaged", "Defective"],
    "non_eligible_conditions": ["Used"],
    "require_delivered_order": True
}