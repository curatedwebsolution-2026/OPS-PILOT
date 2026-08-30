# ADR-001: PostgreSQL & pgvector as Primary Data & Vector Store

## Context
OPS PILOT requires robust relational data storage for structured tenant accounts, users, workflows, execution timelines, and audit logs, as well as dense vector embedding storage for semantic similarity search in the RAG pipeline.

## Decision
We selected **PostgreSQL 16** with the **pgvector** extension.

## Justification
1. **Unified Storage Engine:** Avoids operational overhead of maintaining a separate dedicated vector database (like Pinecone or Milvus) alongside a relational database.
2. **ACID Compliance & Joins:** Allows joining vector similarity search results directly with relational tenant tables (`documents`, `organizations`) in a single query while preserving strict `org_id` multi-tenant filtering.
3. **Local Dev Flexibility:** Enables SQLite fallback for zero-dependency local development and unit testing.
