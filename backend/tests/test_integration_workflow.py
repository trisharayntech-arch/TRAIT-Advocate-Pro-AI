import io

def test_full_12_step_integration_workflow(client):
    # Step 1: Register
    reg_res = client.post("/api/v1/auth/register", json={
        "email": "e2e.advocate@traitlaw.in",
        "password": "MasterWorkflow@2026",
        "full_name": "Adv. Vikram Sethi",
        "bar_enrollment_number": "D/8888/2017",
        "phone": "+91 98765 00000",
        "law_firm": "Sethi & Associates"
    })
    assert reg_res.status_code == 201

    # Step 2: Login
    login_res = client.post("/api/v1/auth/login", json={
        "email": "e2e.advocate@traitlaw.in",
        "password": "MasterWorkflow@2026"
    })
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Step 3: Create Client
    client_res = client.post("/api/v1/clients", headers=headers, json={
        "full_name": "Hindustan Steelworks Ltd.",
        "email": "legal@hindustansteel.in",
        "phone": "+91 33 2288 1111",
        "address": "5 Council House Street, Kolkata",
        "notes": "Steel consignment disputes"
    })
    assert client_res.status_code == 201
    client_id = client_res.json()["id"]

    # Step 4: Create Case
    case_res = client.post("/api/v1/cases", headers=headers, json={
        "client_id": client_id,
        "case_number": "CS(COMM) 777/2026",
        "title": "Hindustan Steelworks vs. National Heavy Engg.",
        "court_name": "High Court of Calcutta",
        "case_type": "Commercial",
        "status": "Active",
        "filing_date": "2026-03-01",
        "next_hearing_date": "2026-11-28",
        "description": "Recovery suit for supply of structural steel"
    })
    assert case_res.status_code == 201
    case_id = case_res.json()["id"]

    # Step 5: Upload Document (TXT / PDF)
    doc_content = b"COMMERCIAL CONTRACT AGREEMENT FOR SUPPLY OF TMT BARS DATED 12.04.2025."
    upload_res = client.post(
        "/api/v1/documents/upload",
        headers=headers,
        files={"file": ("contract_agreement.txt", io.BytesIO(doc_content), "text/plain")},
        data={"case_id": case_id, "client_id": client_id}
    )
    assert upload_res.status_code == 201
    doc_id = upload_res.json()["id"]

    # Step 6: Ask AI a question with document context (RAG)
    chat_res = client.post("/api/v1/assistant/chat", headers=headers, json={
        "message": "What is the subject matter of the contract?",
        "document_id": doc_id
    })
    assert chat_res.status_code == 200
    assert len(chat_res.json()["messages"]) >= 2

    # Step 7: Generate Draft
    draft_res = client.post("/api/v1/drafts/generate", headers=headers, json={
        "title": "Demand Notice for Recovery of Dues",
        "draft_type": "Legal Notice",
        "instructions": "Demand 75 lakhs unpaid invoice dues",
        "parties": "Hindustan Steelworks vs National Heavy Engg",
        "facts": "Invoices were raised between April and July 2025."
    })
    assert draft_res.status_code == 200
    draft_id = draft_res.json()["id"]

    # Step 8: Save Draft (Update)
    update_draft_res = client.put(f"/api/v1/drafts/{draft_id}", headers=headers, json={
        "content": "REVISED LEGAL NOTICE WITH VERIFIED CLAUSES BY ADVOCATE SETHI."
    })
    assert update_draft_res.status_code == 200
    assert "REVISED LEGAL NOTICE" in update_draft_res.json()["content"]

    # Step 9: Search Records
    search_res = client.get("/api/v1/search?q=Hindustan", headers=headers)
    assert search_res.status_code == 200
    assert search_res.json()["total_results"] >= 1

    # Step 10: Logout (Client clears local token, server verifies token validation)
    # Step 11: Login again
    relogin_res = client.post("/api/v1/auth/login", json={
        "email": "e2e.advocate@traitlaw.in",
        "password": "MasterWorkflow@2026"
    })
    assert relogin_res.status_code == 200
    new_token = relogin_res.json()["access_token"]
    new_headers = {"Authorization": f"Bearer {new_token}"}

    # Step 12: Verify persistence
    persisted_case = client.get(f"/api/v1/cases/{case_id}", headers=new_headers)
    assert persisted_case.status_code == 200
    assert persisted_case.json()["case_number"] == "CS(COMM) 777/2026"

    persisted_client = client.get(f"/api/v1/clients/{client_id}", headers=new_headers)
    assert persisted_client.status_code == 200
    assert persisted_client.json()["full_name"] == "Hindustan Steelworks Ltd."

    persisted_draft = client.get(f"/api/v1/drafts/{draft_id}", headers=new_headers)
    assert persisted_draft.status_code == 200
    assert "REVISED LEGAL NOTICE" in persisted_draft.json()["content"]
