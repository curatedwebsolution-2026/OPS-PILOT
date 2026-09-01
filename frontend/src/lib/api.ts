import { TokenResponse, User, Workflow, WorkflowExecution, ApprovalRequest, Document, RAGSearchResult, AuditLog, DashboardStats } from "../types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API_PREFIX = "/api/v1";

function getAuthHeaders(): Record<string, string> {
  const token = typeof window !== "undefined" ? localStorage.getItem("opspilot_token") : null;
  return token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" };
}

async function handleResponse<T>(res: Response, defaultMessage: string): Promise<T> {
  if (res.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("opspilot_token");
      if (window.location.pathname !== "/login" && window.location.pathname !== "/signup") {
        window.location.href = "/login";
      }
    }
    throw new Error("Unauthorized session. Please log in.");
  }
  if (!res.ok) {
    let errorDetail = defaultMessage;
    try {
      const errJson = await res.json();
      if (errJson && errJson.detail) {
        errorDetail = typeof errJson.detail === "string" ? errJson.detail : JSON.stringify(errJson.detail);
      }
    } catch {}
    throw new Error(errorDetail);
  }
  return res.json();
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<TokenResponse> {
    const res = await fetch(`${API_BASE}${API_PREFIX}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse<TokenResponse>(res, "Invalid email or password");
  },

  async signup(org_name: string, full_name: string, email: string, password: string): Promise<TokenResponse> {
    const res = await fetch(`${API_BASE}${API_PREFIX}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ org_name, full_name, email, password }),
    });
    return handleResponse<TokenResponse>(res, "Signup failed. Email may already be registered.");
  },

  async getMe(): Promise<User> {
    const res = await fetch(`${API_BASE}${API_PREFIX}/auth/me`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<User>(res, "Failed to fetch user session");
  },

  // Dashboard Stats
  async getDashboardStats(): Promise<DashboardStats> {
    const res = await fetch(`${API_BASE}${API_PREFIX}/dashboard/stats`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<DashboardStats>(res, "Failed to fetch dashboard stats");
  },

  // Workflows
  async listWorkflows(): Promise<Workflow[]> {
    const res = await fetch(`${API_BASE}${API_PREFIX}/workflows`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Workflow[]>(res, "Failed to list workflows");
  },

  async createWorkflow(title: string, description: string, graph_json: any): Promise<Workflow> {
    const res = await fetch(`${API_BASE}${API_PREFIX}/workflows`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ title, description, graph_json }),
    });
    return handleResponse<Workflow>(res, "Failed to create workflow");
  },

  async getWorkflow(id: string): Promise<Workflow> {
    const res = await fetch(`${API_BASE}${API_PREFIX}/workflows/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Workflow>(res, "Failed to fetch workflow");
  },

  async executeWorkflow(id: string, payload: any): Promise<WorkflowExecution> {
    const res = await fetch(`${API_BASE}${API_PREFIX}/workflows/${id}/execute`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ trigger_payload: payload }),
    });
    return handleResponse<WorkflowExecution>(res, "Failed to execute workflow");
  },

  // Executions
  async listExecutions(): Promise<WorkflowExecution[]> {
    const res = await fetch(`${API_BASE}${API_PREFIX}/executions`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<WorkflowExecution[]>(res, "Failed to list executions");
  },

  async getExecution(id: string): Promise<WorkflowExecution> {
    const res = await fetch(`${API_BASE}${API_PREFIX}/executions/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<WorkflowExecution>(res, "Failed to fetch execution detail");
  },

  // Approvals
  async listApprovals(status: string = "pending"): Promise<ApprovalRequest[]> {
    const res = await fetch(`${API_BASE}${API_PREFIX}/approvals?status_filter=${status}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<ApprovalRequest[]>(res, "Failed to list approvals");
  },

  async resolveApproval(id: string, approved: boolean, comment?: string): Promise<any> {
    const res = await fetch(`${API_BASE}${API_PREFIX}/approvals/${id}/decision`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ approved, comment }),
    });
    return handleResponse<any>(res, "Failed to process approval decision");
  },

  // Knowledge & RAG
  async listDocuments(): Promise<Document[]> {
    const res = await fetch(`${API_BASE}${API_PREFIX}/knowledge`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Document[]>(res, "Failed to list documents");
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
    return handleResponse<Document>(res, "Document upload failed");
  },

  async searchKnowledge(query: string, top_k: number = 4): Promise<RAGSearchResult[]> {
    const res = await fetch(`${API_BASE}${API_PREFIX}/knowledge/search`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ query, top_k }),
    });
    return handleResponse<RAGSearchResult[]>(res, "RAG search failed");
  },

  // Audit Logs
  async listAuditLogs(event_type?: string): Promise<AuditLog[]> {
    const url = event_type
      ? `${API_BASE}${API_PREFIX}/audit-logs?event_type=${event_type}`
      : `${API_BASE}${API_PREFIX}/audit-logs`;
    const res = await fetch(url, {
      headers: getAuthHeaders(),
    });
    return handleResponse<AuditLog[]>(res, "Failed to fetch audit logs");
  },

  // Integrations / Tools
  async listTools(): Promise<any[]> {
    const res = await fetch(`${API_BASE}${API_PREFIX}/integrations/tools`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<any[]>(res, "Failed to fetch tools catalog");
  }
};
