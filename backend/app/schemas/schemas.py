from datetime import datetime
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, EmailStr, Field, ConfigDict

# Auth & User Schemas
class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserSignup(BaseModel):
    org_name: str
    full_name: str
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    org_id: str
    email: str
    full_name: str
    role: str
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
    organization_name: str

# Tenant / Organization Schema
class OrganizationResponse(BaseModel):
    id: str
    name: str
    slug: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Workflow Schemas
class WorkflowCreate(BaseModel):
    title: str
    description: Optional[str] = None
    graph_json: Dict[str, Any]  # { "nodes": [...], "edges": [...] }

class WorkflowUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    graph_json: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None

class WorkflowResponse(BaseModel):
    id: str
    org_id: str
    title: str
    description: Optional[str]
    graph_json: Dict[str, Any]
    is_active: bool
    version: int
    created_by: Optional[str]
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class WorkflowExecutionRequest(BaseModel):
    trigger_payload: Dict[str, Any] = Field(default_factory=dict)

# Workflow Execution & Timeline Schemas
class ExecutionTimelineNodeResponse(BaseModel):
    id: str
    node_id: str
    node_type: str
    node_label: str
    status: str
    input_data: Optional[Dict[str, Any]] = None
    output_data: Optional[Dict[str, Any]] = None
    duration_ms: float
    timestamp: datetime
    error_message: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class WorkflowExecutionResponse(BaseModel):
    id: str
    org_id: str
    workflow_id: str
    status: str
    risk_level: str
    current_node_id: Optional[str]
    trigger_payload: Optional[Dict[str, Any]]
    result_data: Optional[Dict[str, Any]]
    started_at: datetime
    completed_at: Optional[datetime]
    execution_time_ms: float
    error_message: Optional[str]
    timeline_nodes: List[ExecutionTimelineNodeResponse] = []

    model_config = ConfigDict(from_attributes=True)

# Approval Schemas
class ApprovalRequestResponse(BaseModel):
    id: str
    org_id: str
    execution_id: str
    workflow_id: str
    risk_level: str
    proposed_action: str
    ai_recommendation: str
    reason: str
    retrieved_evidence: Optional[List[Dict[str, Any]]] = None
    status: str
    reviewed_by: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    comment: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ApprovalDecisionRequest(BaseModel):
    approved: bool
    comment: Optional[str] = None

# Knowledge & RAG Schemas
class DocumentUploadResponse(BaseModel):
    id: str
    org_id: str
    title: str
    file_type: str
    chunk_count: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class RAGSearchRequest(BaseModel):
    query: str
    top_k: int = 4

class RAGSearchResult(BaseModel):
    chunk_id: str
    document_id: str
    document_title: str
    text_content: str
    score: float
    metadata: Optional[Dict[str, Any]] = None

# Audit Log Schemas
class AuditLogResponse(BaseModel):
    id: str
    org_id: str
    user_id: Optional[str]
    event_type: str
    target_type: Optional[str]
    target_id: Optional[str]
    action_details: Dict[str, Any]
    ip_address: Optional[str]
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)

# Dashboard Analytics Schema
class DashboardStats(BaseModel):
    total_workflows: int
    active_workflows: int
    executions_today: int
    pending_approvals: int
    successful_executions: int
    failed_executions: int
    avg_execution_time_ms: float
    recent_activity: List[AuditLogResponse]
