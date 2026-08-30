# ARCHITECTURE.md - OPS PILOT System Architecture

## 1. Architectural Overview

OPS PILOT is designed around modular, event-driven, microservices-ready design patterns.

### Component Layering

```
[ Frontend: Next.js 14 App Router / React Flow Graph Editor ]
                             │ REST API (JSON)
[ API Gateway & Auth Middleware: FastAPI + JWT Token Scoping ]
                             │
[ Workflow Engine State Machine & Agent Orchestrator ]
  ├── LLM Provider Abstraction Layer (Gemini / OpenAI / Mock)
  ├── RAG Vector Similarity Search Engine (pgvector)
  ├── Safe Tool Sandbox Registry (schema-validated tools)
  └── Human Approval Queue & Risk Matrix
                             │
[ Data Ledger: PostgreSQL + pgvector / Redis Queue / Audit Log ]
```

## 2. Multi-Tenancy Architecture

All entities (`User`, `Workflow`, `Document`, `DocumentChunk`, `WorkflowExecution`, `ApprovalRequest`, `AuditLog`, `ToolIntegration`) contain an indexed `org_id` column.
API endpoints verify JWT tokens and inject `org_id` into all database queries, guaranteeing application- and query-level isolation between tenant organizations.

## 3. Workflow Node Engine (10 Supported Node Types)

1. **Trigger:** Entry node receiving external HTTP webhook or API payload.
2. **Classify:** Intent & priority classifier using LLM provider.
3. **Extract:** Entity extraction parsing structured fields (email, monetary amount, transaction ID).
4. **Retrieve Knowledge:** RAG semantic vector similarity search returning top-k policy chunks.
5. **AI Agent:** LLM reasoning step generating recommended response based on retrieved evidence.
6. **Condition:** Business rule evaluation (e.g. monetary threshold comparison).
7. **Human Approval:** Pauses workflow execution if risk level is High/Critical and queues request in `/approvals`.
8. **Tool Action:** Executes registered sandbox tool (`refund_payment_simulation`, `create_ticket`, `send_email`).
9. **Notification:** Dispatches real-time alerts to monitoring channels.
10. **End:** Marks completion and finalizes execution metrics.
