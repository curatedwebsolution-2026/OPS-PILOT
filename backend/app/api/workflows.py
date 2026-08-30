from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.db.session import get_db
from backend.app.db.models import Workflow, User
from backend.app.schemas.schemas import WorkflowCreate, WorkflowUpdate, WorkflowResponse, WorkflowExecutionRequest, WorkflowExecutionResponse
from backend.app.api.deps import get_current_user
from backend.app.services.workflow_engine import workflow_engine
from backend.app.services.audit_service import audit_service

router = APIRouter(prefix="/workflows", tags=["Workflows"])

@router.get("", response_model=List[WorkflowResponse])
async def list_workflows(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Workflow).where(Workflow.org_id == current_user.org_id).order_by(Workflow.created_at.desc())
    res = await db.execute(stmt)
    workflows = res.scalars().all()
    return workflows

@router.post("", response_model=WorkflowResponse)
async def create_workflow(
    payload: WorkflowCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    workflow = Workflow(
        org_id=current_user.org_id,
        title=payload.title,
        description=payload.description,
        graph_json=payload.graph_json,
        created_by=current_user.id
    )
    db.add(workflow)
    await db.commit()
    await db.refresh(workflow)

    await audit_service.log_event(
        db=db,
        org_id=current_user.org_id,
        user_id=current_user.id,
        event_type="workflow.create",
        target_type="Workflow",
        target_id=workflow.id,
        action_details={"title": workflow.title}
    )

    return workflow

@router.get("/{workflow_id}", response_model=WorkflowResponse)
async def get_workflow(
    workflow_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Workflow).where(Workflow.id == workflow_id, Workflow.org_id == current_user.org_id)
    res = await db.execute(stmt)
    workflow = res.scalar_one_or_none()
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return workflow

@router.put("/{workflow_id}", response_model=WorkflowResponse)
async def update_workflow(
    workflow_id: str,
    payload: WorkflowUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Workflow).where(Workflow.id == workflow_id, Workflow.org_id == current_user.org_id)
    res = await db.execute(stmt)
    workflow = res.scalar_one_or_none()
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")

    if payload.title is not None:
        workflow.title = payload.title
    if payload.description is not None:
        workflow.description = payload.description
    if payload.graph_json is not None:
        workflow.graph_json = payload.graph_json
        workflow.version += 1
    if payload.is_active is not None:
        workflow.is_active = payload.is_active

    await db.commit()
    await db.refresh(workflow)

    await audit_service.log_event(
        db=db,
        org_id=current_user.org_id,
        user_id=current_user.id,
        event_type="workflow.update",
        target_type="Workflow",
        target_id=workflow.id,
        action_details={"version": workflow.version}
    )

    return workflow

@router.post("/{workflow_id}/execute", response_model=WorkflowExecutionResponse)
async def execute_workflow(
    workflow_id: str,
    payload: WorkflowExecutionRequest,
    provider: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    try:
        execution = await workflow_engine.execute_workflow(
            db=db,
            org_id=current_user.org_id,
            workflow_id=workflow_id,
            trigger_payload=payload.trigger_payload,
            provider_name=provider
        )
        return execution
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Execution error: {str(e)}")
