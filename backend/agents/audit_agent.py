# Audit Agent
# Records refund workflow activities
# Mock audit log (stored in memory)

from datetime import datetime


AUDIT_LOGS = []


def record_audit_event(
    order_id: str,
    action: str,
    details: str,
    status: str
):
    """Record an event in the refund workflow."""

    audit_entry = {
        "timestamp": datetime.now().isoformat(
            timespec="seconds"
        ),
        "order_id": order_id,
        "action": action,
        "details": details,
        "status": status
    }

    AUDIT_LOGS.append(audit_entry)

    return {
        "success": True,
        "message": "Audit event recorded successfully",
        "audit_entry": audit_entry
    }


def get_audit_logs(order_id: str = None):
    """Retrieve audit logs, optionally filtered by order ID."""

    if order_id is None:
        return AUDIT_LOGS

    return [
        log for log in AUDIT_LOGS
        if log["order_id"] == order_id
    ]