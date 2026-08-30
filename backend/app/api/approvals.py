from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.db.session import get_db
from backend.app.db.models import ApprovalRequest, User
from backend.app.schemas.schemas import ApprovalRequestResponse, ApprovalDecisionRequest
from backend.app.api.deps import get_current_user
from backend.app.services.approval_service import approval_service

router = APIRouter(prefix="/approvals", tags=["Approvals"])

@router.get("", response_model=List[ApprovalRequestResponse])
async def list_approvals(
    status_filter: str = "pending",
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(ApprovalRequest).where(
        ApprovalRequest.org_id == current_user.org_id
    )
    if status_filter != "all":
        stmt = stmt.where(ApprovalRequest.status == status_filter)
    stmt = stmt.order_by(ApprovalRequest.created_at.desc())

    res = await db.execute(stmt)
    approvals = res.scalars().all()
    return approvals

@router.post("/{approval_id}/decision")
async def process_approval_decision(
    approval_id: str,
    payload: ApprovalDecisionRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await approval_service.resolve_request(
        db=db,
        org_id=current_user.org_id,
        approval_id=approval_id,
        approved=payload.approved,
        user_id=current_user.id,
        comment=payload.comment
    )
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error", "Decision processing failed"))
    return result
