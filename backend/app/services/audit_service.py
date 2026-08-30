from typing import Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.db.models import AuditLog

class AuditService:
    @staticmethod
    async def log_event(
        db: AsyncSession,
        org_id: str,
        event_type: str,
        action_details: Dict[str, Any],
        user_id: Optional[str] = None,
        target_type: Optional[str] = None,
        target_id: Optional[str] = None,
        ip_address: Optional[str] = "127.0.0.1"
    ) -> AuditLog:
        audit_entry = AuditLog(
            org_id=org_id,
            user_id=user_id,
            event_type=event_type,
            target_type=target_type,
            target_id=target_id,
            action_details=action_details,
            ip_address=ip_address
        )
        db.add(audit_entry)
        await db.commit()
        await db.refresh(audit_entry)
        return audit_entry

audit_service = AuditService()
