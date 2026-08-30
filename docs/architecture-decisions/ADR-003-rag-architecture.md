# ADR-003: RAG Architecture & Recursive Chunking Strategy

## Context
AI agents require grounding in organization policy documents (e.g. refund rules, SLA matrices) to prevent hallucinations during decision making.

## Decision
We implemented a recursive chunking strategy (500 character target with 50 character overlap) coupled with dense vector embedding generation and cosine similarity lookup.

## Justification
1. **Context Window Optimization:** 500-character chunks fit cleanly into LLM prompts alongside intent context.
2. **Deterministic Fallback:** The embedding engine generates normalized vector representations derived from text content, guaranteeing 100% offline predictability during integration tests.
