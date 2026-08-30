import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_workflow_execution_flow(client: AsyncClient):
    # Register user
    resp = await client.post("/api/v1/auth/signup", json={
        "org_name": "Workflow Test Org",
        "full_name": "Test Runner",
        "email": "runner@testorg.com",
        "password": "Password123!"
    })
    token = resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Create a 4-step workflow: trigger -> classify -> tool_action -> end
    wf_payload = {
        "title": "Support Triage Test",
        "graph_json": {
            "nodes": [
                {"id": "n1", "type": "trigger", "data": {"label": "Incoming Support Request"}},
                {"id": "n2", "type": "classify", "data": {"label": "Classify Request", "categories": ["Technical Support", "Billing"]}},
                {"id": "n3", "type": "tool_action", "data": {"label": "Create Ticket", "tool_key": "create_ticket"}},
                {"id": "n4", "type": "end", "data": {"label": "Done"}}
            ],
            "edges": []
        }
    }
    wf_resp = await client.post("/api/v1/workflows", json=wf_payload, headers=headers)
    wf_id = wf_resp.json()["id"]

    # Execute workflow
    exec_resp = await client.post(
        f"/api/v1/workflows/{wf_id}/execute",
        json={"trigger_payload": {"request": "Password reset needed for my account."}},
        headers=headers
    )
    assert exec_resp.status_code == 200
    exec_data = exec_resp.json()
    assert exec_data["status"] == "completed"
    assert len(exec_data["timeline_nodes"]) == 4
