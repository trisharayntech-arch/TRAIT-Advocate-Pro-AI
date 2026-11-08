def register_user(client, email, name):
    res = client.post("/api/v1/auth/register", json={
        "email": email,
        "password": "SecretPassword@123",
        "full_name": name
    })
    return res.json()["access_token"]

def test_user_data_isolation(client):
    # 1. Register User A and User B
    token_a = register_user(client, "advocate.a@chamber.in", "Advocate A")
    token_b = register_user(client, "advocate.b@chamber.in", "Advocate B")

    headers_a = {"Authorization": f"Bearer {token_a}"}
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # 2. User A creates a Client
    res_client_a = client.post("/api/v1/clients", headers=headers_a, json={
        "full_name": "Private Client of A",
        "email": "private.a@example.com"
    })
    client_a_id = res_client_a.json()["id"]

    # 3. User B lists clients -> should NOT see User A's client
    res_list_b = client.get("/api/v1/clients", headers=headers_b)
    client_ids_b = [c["id"] for c in res_list_b.json()]
    assert client_a_id not in client_ids_b

    # 4. User B attempts direct GET, PUT, DELETE on User A's client -> must return 404
    assert client.get(f"/api/v1/clients/{client_a_id}", headers=headers_b).status_code == 404
    assert client.put(f"/api/v1/clients/{client_a_id}", headers=headers_b, json={"full_name": "Hacked"}).status_code == 404
    assert client.delete(f"/api/v1/clients/{client_a_id}", headers=headers_b).status_code == 404

    # 5. User A creates a Case
    res_case_a = client.post("/api/v1/cases", headers=headers_a, json={
        "case_number": "SEC-007/2026",
        "title": "Private Classified Matter of User A",
        "court_name": "Delhi High Court"
    })
    case_a_id = res_case_a.json()["id"]

    # 6. User B cannot access User A's case
    assert client.get(f"/api/v1/cases/{case_a_id}", headers=headers_b).status_code == 404
    assert client.delete(f"/api/v1/cases/{case_a_id}", headers=headers_b).status_code == 404

    # 7. User A's dashboard stats belong only to User A
    stats_b = client.get("/api/v1/dashboard/stats", headers=headers_b).json()
    assert stats_b["total_clients"] == 0
    assert stats_b["total_cases"] == 0
