# ADR-004: Human-in-the-Loop (HITL) Safety Gates & Risk Evaluation

## Context
AI agents should not autonomously execute high-risk operations (e.g. monetary refunds > $25.00, user deletions) without human verification.

## Decision
We implemented a mandatory Human Approval Gate node in the workflow graph engine.

## Justification
1. **Execution Pausing:** High-risk nodes transition the workflow execution state to `pending_approval` and pause the state machine.
2. **Audited Decisions:** Human reviewers inspect customer context, AI recommendations, and RAG policy evidence in `/approvals` before approving tool execution.
