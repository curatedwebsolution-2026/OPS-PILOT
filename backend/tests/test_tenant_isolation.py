import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_tenant_data_isolation(client: AsyncClient):
    # 1. Register Tenant A
    resp_a = await client.post("/api/v1/auth/signup", json={
        "org_name": "Tenant A Corp",
        "full_name": "User A",
        "email": "user.a@tenanta.com",
        "password": "Password123!"
    })
    token_a = resp_a.json()["access_token"]
    headers_a = {"Authorization": f"Bearer {token_a}"}

    # 2. Register Tenant B
    resp_b = await client.post("/api/v1/auth/signup", json={
        "org_name": "Tenant B Corp",
        "full_name": "User B",
        "email": "user.b@tenantb.com",
        "password": "Password123!"
    })
    token_b = resp_b.json()["access_token"]
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # 3. Tenant A creates a private workflow
    wf_payload = {
        "title": "Tenant A Confidential Workflow",
        "description": "Private workflow for Tenant A",
        "graph_json": {"nodes": [], "edges": []}
    }
    create_wf = await client.post("/api/v1/workflows", json=wf_payload, headers=headers_a)
    assert create_wf.status_code == 200
    wf_a_id = create_wf.json()["id"]

    # 4. Tenant B lists workflows -> MUST NOT see Tenant A's workflow
    list_b = await client.get("/api/v1/workflows", headers=headers_b)
    assert list_b.status_code == 200
    b_workflows = list_b.json()
    assert len(b_workflows) == 0

    # 5. Tenant B attempts direct GET of Tenant A's workflow -> MUST return 404
    get_wf_b = await client.get(f"/api/v1/workflows/{wf_a_id}", headers=headers_b)
    assert get_wf_b.status_code == 404
