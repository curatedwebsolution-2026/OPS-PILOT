import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_signup_and_login(client: AsyncClient):
    # Test Signup
    signup_payload = {
        "org_name": "Acme Test Corp",
        "full_name": "Test Admin",
        "email": "admin@acme-test.com",
        "password": "Password123!"
    }
    response = await client.post("/api/v1/auth/signup", json=signup_payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "admin@acme-test.com"

    # Test Login
    login_payload = {
        "email": "admin@acme-test.com",
        "password": "Password123!"
    }
    response = await client.post("/api/v1/auth/login", json=login_payload)
    assert response.status_code == 200
    token_data = response.json()
    assert "access_token" in token_data

    # Test Invalid Login
    invalid_login = {
        "email": "admin@acme-test.com",
        "password": "WrongPassword!"
    }
    response = await client.post("/api/v1/auth/login", json=invalid_login)
    assert response.status_code == 401
