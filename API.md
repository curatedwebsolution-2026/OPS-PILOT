# API.md - OPS PILOT REST API Documentation

All API routes are prefixed with `/api/v1` and require `Authorization: Bearer <token>` header (except `/auth/login` and `/auth/signup`).

## Authentication & Tenants
- `POST /api/v1/auth/signup`: Registers new organization tenant & admin user.
- `POST /api/v1/auth/login`: Authenticates user and returns JWT token.
- `GET /api/v1/auth/me`: Returns current user session.

## Workflows
- `GET /api/v1/workflows`: Lists organization workflows.
- `POST /api/v1/workflows`: Creates a new workflow definition graph.
- `GET /api/v1/workflows/{id}`: Fetches workflow graph details.
- `PUT /api/v1/workflows/{id}`: Updates workflow definition.
- `POST /api/v1/workflows/{id}/execute`: Triggers execution with input payload.

## Executions
- `GET /api/v1/executions`: Lists execution history.
- `GET /api/v1/executions/{id}`: Returns execution timeline nodes and step durations.

## Approvals
- `GET /api/v1/approvals`: Lists pending human approval requests.
- `POST /api/v1/approvals/{id}/decision`: Submits approve/reject decision for high-risk action.

## Knowledge Base & RAG
- `GET /api/v1/knowledge`: Lists ingested documents.
- `POST /api/v1/knowledge/upload`: Ingests document file (chunking & embedding generation).
- `POST /api/v1/knowledge/search`: Performs vector similarity search query.

## Audit Logs & Metrics
- `GET /api/v1/audit-logs`: Searchable immutable audit trail.
- `GET /api/v1/dashboard/stats`: Aggregated dashboard analytics stats.
- `GET /metrics`: Prometheus metrics output.
