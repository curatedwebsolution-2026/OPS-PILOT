# SECURITY.md - OPS PILOT Security Architecture

## 1. Threat Model & Guardrails

OPS PILOT operates in enterprise environments where AI agents interface with sensitive financial and operational data. The system enforces strict defense-in-depth principles:

### A. Zero Unrestricted Code Execution
- AI models generate structured JSON tool calls only.
- No model output is ever passed to `eval()`, Python `exec()`, or direct shell commands.
- Tools are statically registered with explicit JSON schema parameters in `tool_registry.py`.

### B. Human-in-the-Loop (HITL) High-Risk Gates
- Actions tagged with `high` or `critical` risk levels (e.g. monetary refunds, subscription cancellations) trigger mandatory execution pausing and queue for human review.
- Human operators must explicitly inspect retrieved policy evidence before approving tool execution.

### C. Multi-Tenant Data Isolation
- Multi-tenancy is enforced at both the API and database layers via tenant-scoped database sessions.
- Tenant A can never query, modify, or execute Tenant B's workflows, knowledge base chunks, or audit logs.

### D. Authentication & Password Safety
- User passwords are hashed using `bcrypt` with salt rounds = 12.
- Sessions use HS256 signed JWT tokens containing explicit `sub` (user_id), `org_id`, and `role` payload claims.
