export interface User {
  id: string;
  org_id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
  organization_name: string;
}

export interface Workflow {
  id: string;
  org_id: string;
  title: string;
  description?: string;
  graph_json: {
    nodes: Array<{ id: string; type: string; data?: any }>;
    edges: Array<{ id: string; source: string; target: string }>;
  };
  is_active: boolean;
  version: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ExecutionTimelineNode {
  id: string;
  node_id: string;
  node_type: string;
  node_label: string;
  status: 'pending' | 'running' | 'completed' | 'pending_approval' | 'failed' | 'skipped';
  input_data?: any;
  output_data?: any;
  duration_ms: number;
  timestamp: string;
  error_message?: string;
}

export interface WorkflowExecution {
  id: string;
  org_id: string;
  workflow_id: string;
  status: 'running' | 'pending_approval' | 'completed' | 'failed' | 'rejected';
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  current_node_id?: string;
  trigger_payload?: any;
  result_data?: any;
  started_at: string;
  completed_at?: string;
  execution_time_ms: number;
  error_message?: string;
  timeline_nodes: ExecutionTimelineNode[];
}

export interface ApprovalRequest {
  id: string;
  org_id: string;
  execution_id: string;
  workflow_id: string;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  proposed_action: string;
  ai_recommendation: string;
  reason: string;
  retrieved_evidence?: Array<{ document_title: string; text_content: string }>;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_by?: string;
  reviewed_at?: string;
  comment?: string;
  created_at: string;
}

export interface Document {
  id: string;
  org_id: string;
  title: string;
  file_type: string;
  chunk_count: number;
  created_at: string;
}

export interface RAGSearchResult {
  chunk_id: string;
  document_id: string;
  document_title: string;
  text_content: string;
  score: number;
  metadata?: any;
}

export interface AuditLog {
  id: string;
  org_id: string;
  user_id?: string;
  event_type: string;
  target_type?: string;
  target_id?: string;
  action_details: any;
  ip_address?: string;
  timestamp: string;
}

export interface DashboardStats {
  total_workflows: number;
  active_workflows: number;
  executions_today: number;
  pending_approvals: number;
  successful_executions: number;
  failed_executions: number;
  avg_execution_time_ms: number;
  recent_activity: AuditLog[];
}
