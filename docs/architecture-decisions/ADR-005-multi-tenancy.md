# ADR-005: Multi-Tenancy Application & Database Layer Isolation

## Context
OPS PILOT serves multiple business organizations. Strict data isolation is mandatory to prevent cross-tenant data exposure.

## Decision
We implemented tenant isolation at both the application and database query layer using `org_id` scoping.

## Justification
1. **JWT Tenant Claims:** All API tokens encode the authenticated user's `org_id`.
2. **Query Scoping:** FastAPI dependencies inject the organization ID into every SQLAlchemy and vector search query, making cross-tenant access impossible.
