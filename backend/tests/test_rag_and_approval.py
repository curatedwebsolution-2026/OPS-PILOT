import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_rag_ingestion_and_approval_flow(client: AsyncClient):
    # Register user
    resp = await client.post("/api/v1/auth/signup", json={
        "org_name": "RAG Approval Org",
        "full_name": "Ops Engineer",
        "email": "ops@rag-approval.com",
        "password": "Password123!"
    })
    token = resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Ingest Knowledge Document
    upload_resp = await client.post(
        "/api/v1/knowledge/upload",
        files={"file": ("policy.txt", b"Duplicate charges above $25 require human approval per policy 4.2.", "text/plain")},
        data={"title": "Billing Refund Standard"},
        headers=headers
    )
    assert upload_resp.status_code == 200
    doc_data = upload_resp.json()
    assert doc_data["title"] == "Billing Refund Standard"

    # 2. Test RAG Vector Search
    search_resp = await client.post(
        "/api/v1/knowledge/search",
        json={"query": "duplicate charge refund", "top_k": 2},
        headers=headers
    )
    assert search_resp.status_code == 200
    search_results = search_resp.json()
    assert len(search_results) > 0
    assert "Duplicate charges" in search_results[0]["text_content"]

    # 3. Create High-Risk Workflow requiring approval
    wf_resp = await client.post("/api/v1/workflows", json={
        "title": "High-Risk Refund Workflow",
        "graph_json": {
            "nodes": [
                {"id": "n1", "type": "trigger", "data": {"label": "Customer Request"}},
                {"id": "n2", "type": "human_approval", "data": {"label": "Human Gate", "proposed_tool": "refund_payment_simulation"}}
            ]
        }
    }, headers=headers)
    wf_id = wf_resp.json()["id"]

    # 4. Trigger execution -> Should enter pending_approval state
    exec_resp = await client.post(
        f"/api/v1/workflows/{wf_id}/execute",
        json={"trigger_payload": {"amount": 150.0, "customer_email": "jane@example.com"}},
        headers=headers
    )
    assert exec_resp.status_code == 200
    exec_data = exec_resp.json()
    assert exec_data["status"] == "pending_approval"

    # 5. Fetch Pending Approval Queue
    app_list_resp = await client.get("/api/v1/approvals?status_filter=pending", headers=headers)
    assert app_list_resp.status_code == 200
    approvals = app_list_resp.json()
    assert len(approvals) == 1
    approval_id = approvals[0]["id"]
    assert approvals[0]["proposed_action"] == "refund_payment_simulation"

    # 6. Approve the request
    decision_resp = await client.post(
        f"/api/v1/approvals/{approval_id}/decision",
        json={"approved": True, "comment": "Verified duplicate charge by customer support supervisor."},
        headers=headers
    )
    assert decision_resp.status_code == 200
    assert decision_resp.json()["status"] == "approved"
    assert decision_resp.json()["tool_result"]["success"] is True

    # 7. Check Audit Logs
    audit_resp = await client.get("/api/v1/audit-logs", headers=headers)
    assert audit_resp.status_code == 200
    logs = audit_resp.json()
    assert len(logs) > 0
