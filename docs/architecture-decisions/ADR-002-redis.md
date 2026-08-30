# ADR-002: Redis for Background Task Broker & Caching

## Context
Long-running operational workflows, document text extraction, embedding generation, and real-time event notifications require an asynchronous task queue broker and fast caching layer.

## Decision
We selected **Redis 7** as the task message broker for Celery workers and caching engine.

## Justification
1. **Low Latency:** Sub-millisecond queue throughput for dispatching background document chunking and worker execution.
2. **Standard Ecosystem:** Seamless integration with Celery and FastAPI async event loops.
