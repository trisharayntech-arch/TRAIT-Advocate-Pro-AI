def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_user_registration_and_login(client):
    reg_payload = {
        "email": "test.advocate@traitlaw.in",
        "password": "Password@123",
        "full_name": "Advocate Test Sharma",
        "bar_enrollment_number": "D/999/2020",
        "phone": "+919876543210",
        "law_firm": "Sharma & Associates"
    }
    # Register
    res = client.post("/api/v1/auth/register", json=reg_payload)
    assert res.status_code == 201
    data = res.json()
    assert "access_token" in data
    assert data["user"]["email"] == "test.advocate@traitlaw.in"
    token = data["access_token"]

    # Duplicate registration prevention
    dup_res = client.post("/api/v1/auth/register", json=reg_payload)
    assert dup_res.status_code == 400

    # Login
    login_res = client.post("/api/v1/auth/login", json={
        "email": "test.advocate@traitlaw.in",
        "password": "Password@123"
    })
    assert login_res.status_code == 200
    assert "access_token" in login_res.json()

    # Invalid credentials
    bad_login = client.post("/api/v1/auth/login", json={
        "email": "test.advocate@traitlaw.in",
        "password": "WrongPassword!"
    })
    assert bad_login.status_code == 401

    # Protected me endpoint
    me_res = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert me_res.status_code == 200
    assert me_res.json()["full_name"] == "Advocate Test Sharma"
