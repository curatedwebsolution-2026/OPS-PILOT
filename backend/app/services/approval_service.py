from datetime import datetime, timezone
from typing import Dict, Any, Optional, List
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.db.models import ApprovalRequest, WorkflowExecution
from backend.app.services.tool_registry import tool_registry
from backend.app.services.audit_service import audit_service

class ApprovalService:
    async def create_request(
        self,
        db: AsyncSession,
        org_id: str,
        execution_id: str,
        workflow_id: str,
        risk_level: str,
        proposed_action: str,
        ai_recommendation: str,
        reason: str,
        retrieved_evidence: Optional[List[Dict[str, Any]]] = None
    ) -> ApprovalRequest:
        req = ApprovalRequest(
            org_id=org_id,
            execution_id=execution_id,
            workflow_id=workflow_id,
            risk_level=risk_level,
            proposed_action=proposed_action,
            ai_recommendation=ai_recommendation,
            reason=reason,
            retrieved_evidence=retrieved_evidence or [],
            status="pending"
        )
        db.add(req)
        await db.commit()
        await db.refresh(req)

        await audit_service.log_event(
            db=db,
            org_id=org_id,
            event_type="approval.requested",
            target_type="ApprovalRequest",
            target_id=req.id,
            action_details={
                "execution_id": execution_id,
                "proposed_action": proposed_action,
                "risk_level": risk_level,
                "reason": reason
            }
        )
        return req

    async def resolve_request(
        self,
        db: AsyncSession,
        org_id: str,
        approval_id: str,
        approved: bool,
        user_id: str,
        comment: Optional[str] = None
    ) -> Dict[str, Any]:
        stmt = select(ApprovalRequest).where(
            ApprovalRequest.id == approval_id,
            ApprovalRequest.org_id == org_id
        )
        result = await db.execute(stmt)
        req = result.scalar_one_or_none()

        if not req:
            return {"success": False, "error": "Approval request not found."}

        if req.status != "pending":
            return {"success": False, "error": f"Approval request is already {req.status}."}

        req.status = "approved" if approved else "rejected"
        req.reviewed_by = user_id
        req.reviewed_at = datetime.now(timezone.utc)
        req.comment = comment

        # Fetch associated execution
        exec_stmt = select(WorkflowExecution).where(WorkflowExecution.id == req.execution_id)
        exec_res = await db.execute(exec_stmt)
        execution = exec_res.scalar_one_or_none()

        tool_result = None
        if approved:
            # Execute tool upon approval
            tool_args = {}
            if execution and execution.trigger_payload:
                tool_args = execution.trigger_payload

            tool_result = await tool_registry.execute_tool(
                key=req.proposed_action,
                args=tool_args,
                org_id=org_id
            )

            if execution:
                execution.status = "completed"
                execution.completed_at = datetime.now(timezone.utc)
                execution.result_data = {
                    "status": "APPROVED_AND_EXECUTED",
                    "tool": req.proposed_action,
                    "tool_output": tool_result
                }
        else:
            if execution:
                execution.status = "rejected"
                execution.completed_at = datetime.now(timezone.utc)
                execution.result_data = {
                    "status": "REJECTED_BY_OPERATOR",
                    "reason": comment or "Manual rejection by human reviewer"
                }

        await db.commit()

        await audit_service.log_event(
            db=db,
            org_id=org_id,
            user_id=user_id,
            event_type="approval.approved" if approved else "approval.rejected",
            target_type="ApprovalRequest",
            target_id=approval_id,
            action_details={
                "approved": approved,
                "tool_executed": req.proposed_action if approved else None,
                "tool_result": tool_result,
                "comment": comment
            }
        )

        return {
            "success": True,
            "status": req.status,
            "tool_result": tool_result
        }

approval_service = ApprovalService()
