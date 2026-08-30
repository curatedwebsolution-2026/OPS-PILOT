from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.db.session import get_db
from backend.app.db.models import AuditLog, User
from backend.app.schemas.schemas import AuditLogResponse
from backend.app.api.deps import get_current_user

router = APIRouter(prefix="/audit-logs", tags=["Audit Logs"])

@router.get("", response_model=List[AuditLogResponse])
async def search_audit_logs(
    event_type: Optional[str] = Query(None),
    limit: int = Query(50, le=200),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(AuditLog).where(AuditLog.org_id == current_user.org_id)
    if event_type:
        stmt = stmt.where(AuditLog.event_type == event_type)
    stmt = stmt.order_by(AuditLog.timestamp.desc()).limit(limit)

    res = await db.execute(stmt)
    logs = res.scalars().all()
    return logs
