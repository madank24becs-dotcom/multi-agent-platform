
# Orchestrator Agent
# Coordinates specialized agents and tracks workflow execution.

from agents.order_agent import get_order_details
from agents.customer_agent import get_customer_details
from agents.policy_agent import check_refund_eligibility
from agents.refund_agent import process_refund
from agents.notification_agent import generate_refund_notification
from agents.audit_agent import record_audit_event


def execute_refund_workflow(order_id: str):
    """Execute the mock refund workflow with agent tracking."""

    workflow_result = {
        "order_id": order_id,
        "success": False,
        "message": "",
        "steps": {},
        "agent_statuses": {
            "Order Agent": "Pending",
            "Customer Agent": "Pending",
            "Policy Agent": "Pending",
            "Refund Agent": "Pending",
            "Notification Agent": "Pending",
        },
    }

    statuses = workflow_result["agent_statuses"]

    # Step 1: Order Agent
    order = get_order_details(order_id)

    if order is None:
        statuses["Order Agent"] = "Failed"

        record_audit_event(
            order_id, "Order Lookup", "Order not found", "Failed"
        )

        workflow_result["message"] = "Order not found"

        for agent in ["Customer Agent", "Policy Agent",
                      "Refund Agent", "Notification Agent"]:
            statuses[agent] = "Skipped"

        return workflow_result

    workflow_result["steps"]["order"] = order
    statuses["Order Agent"] = "Completed"

    record_audit_event(
        order_id, "Order Lookup", "Order details retrieved", "Success"
    )

    # Step 2: Customer Agent
    customer = get_customer_details(order["customer_id"])

    if customer is None:
        statuses["Customer Agent"] = "Failed"

        record_audit_event(
            order_id, "Customer Lookup", "Customer not found", "Failed"
        )

        workflow_result["message"] = "Customer not found"

        for agent in ["Policy Agent", "Refund Agent",
                      "Notification Agent"]:
            statuses[agent] = "Skipped"

        return workflow_result

    workflow_result["steps"]["customer"] = customer
    statuses["Customer Agent"] = "Completed"

    record_audit_event(
        order_id, "Customer Lookup", "Customer details retrieved", "Success"
    )

    # Step 3: Policy Agent
    eligibility = check_refund_eligibility(order)
    workflow_result["steps"]["eligibility"] = eligibility

    if eligibility.get("eligible"):
        statuses["Policy Agent"] = "Completed"
    else:
        statuses["Policy Agent"] = "Rejected"

    record_audit_event(
        order_id,
        "Policy Check",
        eligibility.get("reason", "Policy checked"),
        "Success" if eligibility.get("eligible") else "Rejected"
    )

    if not eligibility.get("eligible"):
        workflow_result["message"] = eligibility.get(
            "reason", "Refund not eligible"
        )

        statuses["Refund Agent"] = "Skipped"
        statuses["Notification Agent"] = "Skipped"

        return workflow_result

    # Step 4: Refund Agent
    refund = process_refund(order, eligibility)
    workflow_result["steps"]["refund"] = refund

    if not refund.get("success"):
        statuses["Refund Agent"] = "Failed"
        statuses["Notification Agent"] = "Skipped"

        workflow_result["message"] = refund.get(
            "message", "Refund processing failed"
        )

        record_audit_event(
            order_id,
            "Refund Processing",
            workflow_result["message"],
            "Failed"
        )

        return workflow_result

    statuses["Refund Agent"] = "Completed"

    record_audit_event(
        order_id,
        "Refund Processing",
        refund.get("message", "Refund processed"),
        "Success"
    )

    # Step 5: Notification Agent
    notification = generate_refund_notification(customer, refund)
    workflow_result["steps"]["notification"] = notification

    statuses["Notification Agent"] = (
        "Completed" if notification.get("success") else "Failed"
    )

    record_audit_event(
        order_id,
        "Customer Notification",
        notification.get("message", "Notification generated"),
        "Success" if notification.get("success") else "Failed"
    )

    # Step 6: Final result
    workflow_result["success"] = True
    workflow_result["message"] = "Refund workflow completed"
    workflow_result["refund"] = refund

    return workflow_result