import asyncio
from datetime import datetime, timezone
from sqlalchemy import select
from backend.app.db.session import async_engine, AsyncSessionLocal, Base
from backend.app.db.models import Organization, User, Workflow, Document, DocumentChunk, WorkflowExecution, ApprovalRequest, AuditLog
from backend.app.core.security import get_password_hash
from backend.app.services.rag_service import rag_service

async def seed_database():
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        # Check if Demo Organization already exists
        res = await db.execute(select(Organization).where(Organization.slug == "demo-ops"))
        existing_org = res.scalar_one_or_none()

        if existing_org:
            print("Database already seeded.")
            return

        print("Seeding database with Demo Operations tenant data...")

        # 1. Create Organization
        org = Organization(
            name="Demo Operations",
            slug="demo-ops"
        )
        db.add(org)
        await db.flush()

        # 2. Create Users
        admin_user = User(
            org_id=org.id,
            email="admin@demo-ops.com",
            password_hash=get_password_hash("DemoPassword123!"),
            full_name="Alex Mercer (CTO)",
            role="admin"
        )
        operator_user = User(
            org_id=org.id,
            email="operator@demo-ops.com",
            password_hash=get_password_hash("DemoPassword123!"),
            full_name="Sarah Jenkins (Ops Lead)",
            role="operator"
        )
        db.add_all([admin_user, operator_user])
        await db.flush()

        # 3. Create Sample Knowledge Base Documents
        refund_policy_text = """
        DEMO OPERATIONS - SUBSCRIPTION REFUND & BILLING POLICY (v2.4)
        
        Section 1: Duplicate Charges
        If a customer experiences a duplicate charge due to payment gateway retry anomalies or system latency, the customer is entitled to a 100% full refund of the duplicate transaction.
        - Transactions under $25.00 may be automatically approved by the AI Operations Engine.
        - Transactions $25.00 and above REQUIRE HUMAN APPROVAL by a designated Operations Specialist or Billing Manager.
        
        Section 2: SLA & Refund Processing Time
        All approved refund requests must be transmitted to the Stripe Payment Simulator within 1 hour.
        Customers will receive credit settlement within 3-5 business days.

        Section 3: Cancellation Policy
        Subscriptions cancelled within 14 days of initial renewal are eligible for pro-rated refund credits.
        """
        
        sla_policy_text = """
        SUPPORT SLA & ESCALATION MATRIX
        
        Priority Levels:
        - Critical (P1): Billing failures, payment gateway errors, outage reports. Response SLA: 15 minutes.
        - High (P2): Duplicate charge inquiries, account access issues. Response SLA: 1 hour.
        - Medium (P3): General feature questions, profile updates. Response SLA: 4 hours.
        
        Human Escalation Gates:
        Any automated action that alters customer billing states or issues financial credits exceeding $25 must be queued for Human Approval in the Operations Control Panel.
        """

        doc1 = await rag_service.ingest_document(
            db=db,
            org_id=org.id,
            title="Subscription Refund Policy v2.4",
            file_type="txt",
            content=refund_policy_text,
            doc_metadata={"category": "Billing"}
        )

        doc2 = await rag_service.ingest_document(
            db=db,
            org_id=org.id,
            title="Support SLA & Escalation Matrix",
            file_type="txt",
            content=sla_policy_text,
            doc_metadata={"category": "Support"}
        )

        # 4. Create Workflows
        workflow_billing = Workflow(
            org_id=org.id,
            title="Customer Billing & Refund Assistant",
            description="Automates incoming customer billing inquiries, classifies intent, retrieves refund policies, evaluates risk, and queues human approval for refunds.",
            graph_json={
                "nodes": [
                    {"id": "node-1", "type": "trigger", "data": {"label": "Incoming Request"}},
                    {"id": "node-2", "type": "classify", "data": {"label": "Classify Intent", "categories": ["Billing & Financial", "Account Access", "Technical Support"]}},
                    {"id": "node-3", "type": "extract", "data": {"label": "Extract Entities", "fields": ["email", "amount", "transaction_id"]}},
                    {"id": "node-4", "type": "retrieve_knowledge", "data": {"label": "Retrieve Policies (RAG)"}},
                    {"id": "node-5", "type": "ai_agent", "data": {"label": "AI Reasoning Agent"}},
                    {"id": "node-6", "type": "condition", "data": {"label": "Monetary Risk Check", "threshold": 25.0}},
                    {"id": "node-7", "type": "human_approval", "data": {"label": "Human Approval Gate", "proposed_tool": "refund_payment_simulation"}},
                    {"id": "node-8", "type": "tool_action", "data": {"label": "Execute Refund", "tool_key": "refund_payment_simulation"}},
                    {"id": "node-9", "type": "notification", "data": {"label": "Notify Customer & Team"}},
                    {"id": "node-10", "type": "end", "data": {"label": "Complete Workflow"}}
                ],
                "edges": [
                    {"id": "e1-2", "source": "node-1", "target": "node-2"},
                    {"id": "e2-3", "source": "node-2", "target": "node-3"},
                    {"id": "e3-4", "source": "node-3", "target": "node-4"},
                    {"id": "e4-5", "source": "node-4", "target": "node-5"},
                    {"id": "e5-6", "source": "node-5", "target": "node-6"},
                    {"id": "e6-7", "source": "node-6", "target": "node-7"},
                    {"id": "e7-8", "source": "node-7", "target": "node-8"},
                    {"id": "e8-9", "source": "node-8", "target": "node-9"},
                    {"id": "e9-10", "source": "node-9", "target": "node-10"}
                ]
            },
            created_by=admin_user.id
        )

        workflow_triage = Workflow(
            org_id=org.id,
            title="Support Ticket Triage & Routing",
            description="Automatically triages incoming support requests, tags severity levels, and notifies support leads.",
            graph_json={
                "nodes": [
                    {"id": "node-1", "type": "trigger", "data": {"label": "Customer Email Received"}},
                    {"id": "node-2", "type": "classify", "data": {"label": "Classify Support Category"}},
                    {"id": "node-3", "type": "ai_agent", "data": {"label": "Generate Triage Recommendation"}},
                    {"id": "node-4", "type": "tool_action", "data": {"label": "Create Support Ticket", "tool_key": "create_ticket"}},
                    {"id": "node-5", "type": "end", "data": {"label": "Triage Finished"}}
                ],
                "edges": [
                    {"id": "e1-2", "source": "node-1", "target": "node-2"},
                    {"id": "e2-3", "source": "node-2", "target": "node-3"},
                    {"id": "e3-4", "source": "node-3", "target": "node-4"},
                    {"id": "e4-5", "source": "node-4", "target": "node-5"}
                ]
            },
            created_by=admin_user.id
        )

        db.add_all([workflow_billing, workflow_triage])
        await db.flush()

        # 5. Create Sample Executions & Pending Approval
        exec1 = WorkflowExecution(
            org_id=org.id,
            workflow_id=workflow_billing.id,
            status="pending_approval",
            risk_level="high",
            current_node_id="node-7",
            trigger_payload={
                "customer_email": "jane.doe@acme-corp.com",
                "request": "I was charged twice for my monthly subscription. Transaction ID TXN-9941 for $49.00.",
                "amount": 49.00,
                "transaction_id": "TXN-9941"
            },
            started_at=datetime.now(timezone.utc)
        )
        db.add(exec1)
        await db.flush()

        app_req = ApprovalRequest(
            org_id=org.id,
            execution_id=exec1.id,
            workflow_id=workflow_billing.id,
            risk_level="high",
            proposed_action="refund_payment_simulation",
            ai_recommendation="Approve 100% refund of $49.00 for duplicate transaction TXN-9941.",
            reason="Refund amount ($49.00) exceeds human approval threshold ($25.00).",
            retrieved_evidence=[{
                "document_title": "Subscription Refund Policy v2.4",
                "text_content": "If a customer experiences a duplicate charge... Transactions $25.00 and above REQUIRE HUMAN APPROVAL."
            }],
            status="pending"
        )
        db.add(app_req)

        # 6. Audit Log Entries
        audit1 = AuditLog(
            org_id=org.id,
            user_id=admin_user.id,
            event_type="auth.login",
            action_details={"email": admin_user.email, "status": "SUCCESS"}
        )
        audit2 = AuditLog(
            org_id=org.id,
            user_id=admin_user.id,
            event_type="workflow.create",
            target_type="Workflow",
            target_id=workflow_billing.id,
            action_details={"title": workflow_billing.title}
        )
        audit3 = AuditLog(
            org_id=org.id,
            event_type="approval.requested",
            target_type="ApprovalRequest",
            target_id=app_req.id,
            action_details={"risk_level": "high", "proposed_action": "refund_payment_simulation"}
        )
        db.add_all([audit1, audit2, audit3])

        await db.commit()
        print("Database successfully seeded with Demo Operations data!")

if __name__ == "__main__":
    asyncio.run(seed_database())
