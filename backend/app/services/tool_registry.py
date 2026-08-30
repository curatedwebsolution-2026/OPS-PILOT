from typing import Dict, Any, List, Optional, Callable
from pydantic import BaseModel, Field

class ToolDefinition(BaseModel):
    key: str
    name: str
    description: str
    risk_level: str  # low, medium, high, critical
    is_simulation: bool = True
    parameters: Dict[str, Any]

class ToolRegistry:
    def __init__(self):
        self._tools: Dict[str, ToolDefinition] = {}

    def register(self, key: str, name: str, description: str, risk_level: str, parameters: Dict[str, Any]):
        self._tools[key] = ToolDefinition(
            key=key,
            name=name,
            description=description,
            risk_level=risk_level,
            is_simulation=True,
            parameters=parameters
        )

    def get_tool(self, key: str) -> Optional[ToolDefinition]:
        return self._tools.get(key)

    def list_tools(self) -> List[ToolDefinition]:
        return list(self._tools.values())

    async def execute_tool(self, key: str, args: Dict[str, Any], org_id: str) -> Dict[str, Any]:
        tool = self.get_tool(key)
        if not tool:
            return {
                "success": False,
                "error": f"Tool '{key}' is not registered in system catalog.",
                "is_simulation": True
            }

        # Simulated Tool Execution Handlers
        if key == "refund_payment_simulation":
            amount = args.get("amount", 0.0)
            tx_id = args.get("transaction_id", "TXN-SIM-9921")
            customer_email = args.get("customer_email", "customer@example.com")
            return {
                "success": True,
                "action": "refund_payment_simulation",
                "is_simulation": True,
                "status": "PROCESSED",
                "details": {
                    "refund_id": f"RFND-{tx_id}",
                    "amount": amount,
                    "currency": "USD",
                    "customer_email": customer_email,
                    "settlement": "Simulation Sandbox API - Approval Verified"
                }
            }
        elif key == "create_ticket":
            subject = args.get("subject", "Operations Ticket")
            priority = args.get("priority", "High")
            return {
                "success": True,
                "action": "create_ticket",
                "is_simulation": True,
                "status": "CREATED",
                "details": {
                    "ticket_id": "TICK-8841",
                    "subject": subject,
                    "priority": priority,
                    "assigned_team": "Billing Operations"
                }
            }
        elif key == "update_ticket":
            ticket_id = args.get("ticket_id", "TICK-8841")
            status = args.get("status", "Resolved")
            return {
                "success": True,
                "action": "update_ticket",
                "is_simulation": True,
                "status": "UPDATED",
                "details": {
                    "ticket_id": ticket_id,
                    "new_status": status,
                    "updated_by": "OpsPilot AI Engine"
                }
            }
        elif key == "send_email":
            to = args.get("to_email", "customer@example.com")
            subject = args.get("subject", "Update regarding your request")
            return {
                "success": True,
                "action": "send_email",
                "is_simulation": True,
                "status": "SENT",
                "details": {
                    "recipient": to,
                    "subject": subject,
                    "dispatch_timestamp": "2026-08-30T14:45:00Z"
                }
            }
        elif key == "update_customer":
            customer_id = args.get("customer_id", "CUST-102")
            notes = args.get("notes", "Updated profile notes.")
            return {
                "success": True,
                "action": "update_customer",
                "is_simulation": True,
                "status": "UPDATED",
                "details": {
                    "customer_id": customer_id,
                    "notes_added": notes
                }
            }
        elif key == "create_notification":
            message = args.get("message", "Alert triggered.")
            return {
                "success": True,
                "action": "create_notification",
                "is_simulation": True,
                "status": "EMITTED",
                "details": {
                    "channel": "Slack #ops-alerts",
                    "message": message
                }
            }
        else:
            return {
                "success": True,
                "action": key,
                "is_simulation": True,
                "status": "COMPLETED",
                "details": args
            }

tool_registry = ToolRegistry()

# Register core safe tools
tool_registry.register(
    key="refund_payment_simulation",
    name="Refund Payment Simulation",
    description="Simulates issuing a billing refund to a customer account. REQUIRES HUMAN APPROVAL.",
    risk_level="high",
    parameters={
        "type": "object",
        "properties": {
            "transaction_id": {"type": "string", "description": "Transaction identifier"},
            "amount": {"type": "number", "description": "Monetary amount to refund"},
            "customer_email": {"type": "string", "description": "Customer email"}
        },
        "required": ["amount", "customer_email"]
    }
)

tool_registry.register(
    key="create_ticket",
    name="Create Support Ticket",
    description="Creates a ticket in the customer support desk system.",
    risk_level="low",
    parameters={
        "type": "object",
        "properties": {
            "subject": {"type": "string"},
            "priority": {"type": "string"},
            "description": {"type": "string"}
        },
        "required": ["subject"]
    }
)

tool_registry.register(
    key="update_ticket",
    name="Update Ticket Status",
    description="Updates the status or comments of an existing support ticket.",
    risk_level="low",
    parameters={
        "type": "object",
        "properties": {
            "ticket_id": {"type": "string"},
            "status": {"type": "string"},
            "resolution_notes": {"type": "string"}
        },
        "required": ["ticket_id", "status"]
    }
)

tool_registry.register(
    key="send_email",
    name="Send Email Notification",
    description="Dispatches a transactional email to the customer or internal team.",
    risk_level="medium",
    parameters={
        "type": "object",
        "properties": {
            "to_email": {"type": "string"},
            "subject": {"type": "string"},
            "body": {"type": "string"}
        },
        "required": ["to_email", "subject", "body"]
    }
)

tool_registry.register(
    key="update_customer",
    name="Update Customer Record",
    description="Updates customer metadata or account preferences.",
    risk_level="medium",
    parameters={
        "type": "object",
        "properties": {
            "customer_id": {"type": "string"},
            "notes": {"type": "string"}
        },
        "required": ["customer_id"]
    }
)

tool_registry.register(
    key="create_notification",
    name="Emit Operational Alert",
    description="Emits a real-time operational notification to monitoring channels.",
    risk_level="low",
    parameters={
        "type": "object",
        "properties": {
            "message": {"type": "string"},
            "severity": {"type": "string"}
        },
        "required": ["message"]
    }
)
