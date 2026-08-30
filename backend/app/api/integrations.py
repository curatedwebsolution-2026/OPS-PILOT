from typing import List
from fastapi import APIRouter, Depends
from backend.app.services.tool_registry import tool_registry, ToolDefinition
from backend.app.api.deps import get_current_user
from backend.app.db.models import User

router = APIRouter(prefix="/integrations", tags=["Integrations & Tools"])

@router.get("/tools", response_model=List[ToolDefinition])
async def list_available_tools(current_user: User = Depends(get_current_user)):
    return tool_registry.list_tools()
