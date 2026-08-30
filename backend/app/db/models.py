import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, Integer, Float, DateTime, Text, JSON, ForeignKey, Index
from sqlalchemy.orm import relationship
from backend.app.db.session import Base

def generate_uuid():
    return str(uuid.uuid4())

def get_utc_now():
    return datetime.now(timezone.utc)

class Organization(Base):
    __tablename__ = "organizations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(128), nullable=False)
    slug = Column(String(128), unique=True, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), default=get_utc_now)

    users = relationship("User", back_populates="organization", cascade="all, delete-orphan")
    workflows = relationship("Workflow", back_populates="organization", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="organization", cascade="all, delete-orphan")

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    org_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(128), nullable=False)
    role = Column(String(32), default="operator")  # admin, operator, viewer
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=get_utc_now)

    organization = relationship("Organization", back_populates="users")

class Workflow(Base):
    __tablename__ = "workflows"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    org_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    graph_json = Column(JSON, nullable=False)  # { "nodes": [...], "edges": [...] }
    is_active = Column(Boolean, default=True)
    version = Column(Integer, default=1)
    created_by = Column(String(36), nullable=True)
    created_at = Column(DateTime(timezone=True), default=get_utc_now)
    updated_at = Column(DateTime(timezone=True), default=get_utc_now, onupdate=get_utc_now)

    organization = relationship("Organization", back_populates="workflows")
    executions = relationship("WorkflowExecution", back_populates="workflow", cascade="all, delete-orphan")

class WorkflowExecution(Base):
    __tablename__ = "workflow_executions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    org_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    workflow_id = Column(String(36), ForeignKey("workflows.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(String(32), nullable=False, default="running", index=True)  # running, pending_approval, completed, failed, rejected
    trigger_payload = Column(JSON, nullable=True)
    result_data = Column(JSON, nullable=True)
    risk_level = Column(String(32), default="low")  # low, medium, high, critical
    current_node_id = Column(String(128), nullable=True)
    started_at = Column(DateTime(timezone=True), default=get_utc_now)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    execution_time_ms = Column(Float, default=0.0)
    error_message = Column(Text, nullable=True)

    workflow = relationship("Workflow", back_populates="executions")
    timeline_nodes = relationship("ExecutionTimelineNode", back_populates="execution", cascade="all, delete-orphan")
    approval_requests = relationship("ApprovalRequest", back_populates="execution", cascade="all, delete-orphan")

class ExecutionTimelineNode(Base):
    __tablename__ = "execution_timeline_nodes"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    execution_id = Column(String(36), ForeignKey("workflow_executions.id", ondelete="CASCADE"), nullable=False, index=True)
    org_id = Column(String(36), nullable=False, index=True)
    node_id = Column(String(128), nullable=False)
    node_type = Column(String(64), nullable=False)
    node_label = Column(String(128), nullable=False)
    status = Column(String(32), nullable=False)  # pending, running, completed, failed, skipped
    input_data = Column(JSON, nullable=True)
    output_data = Column(JSON, nullable=True)
    duration_ms = Column(Float, default=0.0)
    timestamp = Column(DateTime(timezone=True), default=get_utc_now)
    error_message = Column(Text, nullable=True)

    execution = relationship("WorkflowExecution", back_populates="timeline_nodes")

class ApprovalRequest(Base):
    __tablename__ = "approval_requests"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    org_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    execution_id = Column(String(36), ForeignKey("workflow_executions.id", ondelete="CASCADE"), nullable=False, index=True)
    workflow_id = Column(String(36), nullable=False, index=True)
    risk_level = Column(String(32), default="high")  # low, medium, high, critical
    proposed_action = Column(String(128), nullable=False)  # tool name
    ai_recommendation = Column(Text, nullable=False)
    reason = Column(Text, nullable=False)
    retrieved_evidence = Column(JSON, nullable=True)
    status = Column(String(32), default="pending", index=True)  # pending, approved, rejected
    reviewed_by = Column(String(36), nullable=True)
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=get_utc_now)

    execution = relationship("WorkflowExecution", back_populates="approval_requests")

class Document(Base):
    __tablename__ = "documents"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    org_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    file_type = Column(String(32), nullable=False)  # pdf, txt, md, json, docx
    file_path = Column(String(512), nullable=True)
    doc_metadata = Column(JSON, nullable=True)
    chunk_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), default=get_utc_now)

    organization = relationship("Organization", back_populates="documents")
    chunks = relationship("DocumentChunk", back_populates="document", cascade="all, delete-orphan")

class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    org_id = Column(String(36), nullable=False, index=True)
    document_id = Column(String(36), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    chunk_index = Column(Integer, nullable=False)
    text_content = Column(Text, nullable=False)
    embedding_json = Column(JSON, nullable=False)  # List of float embeddings for vector search
    chunk_metadata = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), default=get_utc_now)

    document = relationship("Document", back_populates="chunks")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    org_id = Column(String(36), nullable=False, index=True)
    user_id = Column(String(36), nullable=True, index=True)
    event_type = Column(String(64), nullable=False, index=True)  # auth.login, workflow.create, execution.start, approval.approved, tool.execute
    target_type = Column(String(64), nullable=True)
    target_id = Column(String(36), nullable=True)
    action_details = Column(JSON, nullable=False)
    ip_address = Column(String(45), nullable=True)
    timestamp = Column(DateTime(timezone=True), default=get_utc_now, index=True)

class ToolIntegration(Base):
    __tablename__ = "tool_integrations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    org_id = Column(String(36), nullable=False, index=True)
    tool_key = Column(String(64), nullable=False, index=True)
    name = Column(String(128), nullable=False)
    description = Column(Text, nullable=False)
    risk_level = Column(String(32), default="medium")  # low, medium, high, critical
    is_enabled = Column(Boolean, default=True)
    schema_json = Column(JSON, nullable=False)
    created_at = Column(DateTime(timezone=True), default=get_utc_now)
