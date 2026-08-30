from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.db.session import get_db
from backend.app.db.models import WorkflowExecution, User
from backend.app.schemas.schemas import WorkflowExecutionResponse
from backend.app.api.deps import get_current_user

router = APIRouter(prefix="/executions", tags=["Executions"])

@router.get("", response_model=List[WorkflowExecutionResponse])
async def list_executions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(WorkflowExecution)
        .options(selectinload(WorkflowExecution.timeline_nodes))
        .where(WorkflowExecution.org_id == current_user.org_id)
        .order_by(WorkflowExecution.started_at.desc())
    )
    res = await db.execute(stmt)
    executions = res.scalars().all()
    return executions

@router.get("/{execution_id}", response_model=WorkflowExecutionResponse)
async def get_execution(
    execution_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(WorkflowExecution)
        .options(selectinload(WorkflowExecution.timeline_nodes))
        .where(
            WorkflowExecution.id == execution_id,
            WorkflowExecution.org_id == current_user.org_id
        )
    )
    res = await db.execute(stmt)
    execution = res.scalar_one_or_none()
    if not execution:
        raise HTTPException(status_code=404, detail="Execution not found")
    return execution
