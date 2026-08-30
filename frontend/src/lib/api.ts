import { TokenResponse, User, Workflow, WorkflowExecution, ApprovalRequest, Document, RAGSearchResult, AuditLog, DashboardStats } from "../types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API_PREFIX = "/api/v1";

function getAuthHeaders(): Record<string, string> {
  const token = typeof window !== "undefined" ? localStorage.getItem("opspilot_token") : null;
  return token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" };
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<TokenResponse> {
    const res = await fetch(`${API_BASE}${API_PREFIX}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error("Invalid email or password");
    return res.json();
  },

  async signup(org_name: string, full_name: string, email: string, password: string): Promise<TokenResponse> {
    const res = await fetch(`${API_BASE}${API_PREFIX}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ org_name, full_name, email, password }),
    });
    if (!res.ok) throw new Error("Signup failed. Email may already be registered.");
    return res.json();
  },

  async getMe(): Promise<User> {
    const res = await fetch(`${API_BASE}${API_PREFIX}/auth/me`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch user session");
    return res.json();
  },

  // Dashboard Stats
  async getDashboardStats(): Promise<DashboardStats> {
    const res = await fetch(`${API_BASE}${API_PREFIX}/dashboard/stats`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch dashboard stats");
    return res.json();
  },

  // Workflows
  async listWorkflows(): Promise<Workflow[]> {
    const res = await fetch(`${API_BASE}${API_PREFIX}/workflows`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to list workflows");
    return res.json();
  },

  async createWorkflow(title: string, description: string, graph_json: any): Promise<Workflow> {
    const res = await fetch(`${API_BASE}${API_PREFIX}/workflows`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ title, description, graph_json }),
    });
    if (!res.ok) throw new Error("Failed to create workflow");
    return res.json();
  },

  async getWorkflow(id: string): Promise<Workflow> {
    const res = await fetch(`${API_BASE}${API_PREFIX}/workflows/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch workflow");
    return res.json();
  },

  async executeWorkflow(id: string, payload: any): Promise<WorkflowExecution> {
    const res = await fetch(`${API_BASE}${API_PREFIX}/workflows/${id}/execute`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ trigger_payload: payload }),
    });
    if (!res.ok) throw new Error("Failed to execute workflow");
    return res.json();
  },

  // Executions
  async listExecutions(): Promise<WorkflowExecution[]> {
    const res = await fetch(`${API_BASE}${API_PREFIX}/executions`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to list executions");
    return res.json();
  },

  async getExecution(id: string): Promise<WorkflowExecution> {
    const res = await fetch(`${API_BASE}${API_PREFIX}/executions/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch execution detail");
    return res.json();
  },

  // Approvals
  async listApprovals(status: string = "pending"): Promise<ApprovalRequest[]> {
    const res = await fetch(`${API_BASE}${API_PREFIX}/approvals?status_filter=${status}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to list approvals");
    return res.json();
  },

  async resolveApproval(id: string, approved: boolean, comment?: string): Promise<any> {
    const res = await fetch(`${API_BASE}${API_PREFIX}/approvals/${id}/decision`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ approved, comment }),
    });
    if (!res.ok) throw new Error("Failed to process approval decision");
    return res.json();
  },

  // Knowledge & RAG
  async listDocuments(): Promise<Document[]> {
    const res = await fetch(`${API_BASE}${API_PREFIX}/knowledge`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to list documents");
    return res.json();
  },

  async uploadDocument(file: File, title?: string): Promise<Document> {
    const token = localStorage.getItem("opspilot_token");
    const formData = new FormData();
    formData.append("file", file);
    if (title) formData.append("title", title);

    const res = await fetch(`${API_BASE}${API_PREFIX}/knowledge/upload`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    if (!res.ok) throw new Error("Document upload failed");
    return res.json();
  },

  async searchKnowledge(query: string, top_k: number = 4): Promise<RAGSearchResult[]> {
    const res = await fetch(`${API_BASE}${API_PREFIX}/knowledge/search`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ query, top_k }),
    });
    if (!res.ok) throw new Error("RAG search failed");
    return res.json();
  },

  // Audit Logs
  async listAuditLogs(event_type?: string): Promise<AuditLog[]> {
    const url = event_type
      ? `${API_BASE}${API_PREFIX}/audit-logs?event_type=${event_type}`
      : `${API_BASE}${API_PREFIX}/audit-logs`;
    const res = await fetch(url, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch audit logs");
    return res.json();
  },

  // Integrations / Tools
  async listTools(): Promise<any[]> {
    const res = await fetch(`${API_BASE}${API_PREFIX}/integrations/tools`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch tools catalog");
    return res.json();
  }
};
