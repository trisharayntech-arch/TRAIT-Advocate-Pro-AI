import io

def get_auth_token(client, email="advocate.crud@traitlaw.in"):
    res = client.post("/api/v1/auth/register", json={
        "email": email,
        "password": "SecurePassword@123",
        "full_name": "Advocate CRUD User",
        "bar_enrollment_number": "MAH/123/2018",
        "phone": "+919988776655",
        "law_firm": "Chambers of CRUD"
    })
    return res.json()["access_token"]

def test_client_crud(client):
    token = get_auth_token(client, "client.test@traitlaw.in")
    headers = {"Authorization": f"Bearer {token}"}

    # Create client
    create_res = client.post("/api/v1/clients", headers=headers, json={
        "full_name": "Rahul Verma",
        "email": "rahul.verma@example.com",
        "phone": "+919811122233",
        "address": "12 Connaught Place, New Delhi",
        "notes": "Corporate litigation client"
    })
    assert create_res.status_code == 201
    client_id = create_res.json()["id"]

    # List clients
    list_res = client.get("/api/v1/clients", headers=headers)
    assert list_res.status_code == 200
    assert len(list_res.json()) >= 1

    # Search client
    search_res = client.get("/api/v1/clients?q=Rahul", headers=headers)
    assert search_res.status_code == 200
    assert search_res.json()[0]["full_name"] == "Rahul Verma"

    # Update client
    update_res = client.put(f"/api/v1/clients/{client_id}", headers=headers, json={
        "notes": "Updated retainer notes"
    })
    assert update_res.status_code == 200
    assert update_res.json()["notes"] == "Updated retainer notes"

    # Delete client
    del_res = client.delete(f"/api/v1/clients/{client_id}", headers=headers)
    assert del_res.status_code == 204

def test_case_crud_and_dashboard(client):
    token = get_auth_token(client, "case.test@traitlaw.in")
    headers = {"Authorization": f"Bearer {token}"}

    # Verify zero stats before creation
    initial_stats = client.get("/api/v1/dashboard/stats", headers=headers).json()
    assert initial_stats["total_cases"] == 0
    assert initial_stats["total_clients"] == 0

    # Create case
    case_res = client.post("/api/v1/cases", headers=headers, json={
        "case_number": "ARB.P. 505/2026",
        "title": "Tata Motors Ltd. vs. Infra Project Corp.",
        "court_name": "High Court of Delhi",
        "case_type": "Arbitration",
        "status": "Active",
        "filing_date": "2026-01-10",
        "next_hearing_date": "2026-12-15",
        "description": "Petition under Section 11(6) for arbitrator appointment"
    })
    assert case_res.status_code == 201
    case_data = case_res.json()
    assert case_data["case_number"] == "ARB.P. 505/2026"
    case_id = case_data["id"]

    # Dashboard stats verification - matches real database records
    dash_res = client.get("/api/v1/dashboard/stats", headers=headers)
    assert dash_res.status_code == 200
    stats = dash_res.json()
    assert stats["total_cases"] == 1
    assert stats["active_cases"] == 1
    assert len(stats["upcoming_hearings"]) == 1
    assert stats["upcoming_hearings"][0]["case_number"] == "ARB.P. 505/2026"

    # Update case status
    upd_res = client.put(f"/api/v1/cases/{case_id}", headers=headers, json={
        "status": "Closed"
    })
    assert upd_res.status_code == 200
    assert upd_res.json()["status"] == "Closed"

def test_document_upload_extraction_and_download(client):
    token = get_auth_token(client, "doc.test@traitlaw.in")
    headers = {"Authorization": f"Bearer {token}"}

    sample_txt_content = b"IN THE HIGH COURT OF DELHI AT NEW DELHI\nSUIT NO. 102 OF 2026\nPlaintiff asserts breach of contract under Section 73 Indian Contract Act."
    files = {"file": ("affidavit.txt", io.BytesIO(sample_txt_content), "text/plain")}

    upload_res = client.post("/api/v1/documents/upload", headers=headers, files=files)
    assert upload_res.status_code == 201
    doc_id = upload_res.json()["id"]

    # Check detail & chunking
    detail_res = client.get(f"/api/v1/documents/{doc_id}", headers=headers)
    assert detail_res.status_code == 200
    assert "Plaintiff asserts breach of contract" in detail_res.json()["extracted_text"]

    # Test download via query token (browser direct download simulation)
    dl_res = client.get(f"/api/v1/documents/{doc_id}/download?token={token}")
    assert dl_res.status_code == 200
    assert b"Plaintiff asserts breach of contract" in dl_res.content

def test_draft_generation_and_docx_export(client):
    token = get_auth_token(client, "draft.test@traitlaw.in")
    headers = {"Authorization": f"Bearer {token}"}

    gen_res = client.post("/api/v1/drafts/generate", headers=headers, json={
        "title": "Legal Notice for Non-Payment of Retention Dues",
        "draft_type": "Legal Notice",
        "instructions": "Draft notice for Rs. 50 Lakhs unpaid invoices",
        "parties": "Claimant: ABC Infotech vs Respondent: XYZ Ltd",
        "facts": "Invoices were raised between April and December 2025.",
        "clauses_or_prayers": "Pay full amount within 15 days plus interest."
    })
    assert gen_res.status_code == 200
    draft_id = gen_res.json()["id"]
    assert "LEGAL NOTICE" in gen_res.json()["content"]

    # Export DOCX with Header
    docx_res = client.get(f"/api/v1/drafts/{draft_id}/export-docx", headers=headers)
    assert docx_res.status_code == 200
    assert docx_res.headers["content-type"] == "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    assert len(docx_res.content) > 0

    # Export DOCX with query token (browser link click simulation)
    docx_browser_res = client.get(f"/api/v1/drafts/{draft_id}/export-docx?token={token}")
    assert docx_browser_res.status_code == 200
    assert len(docx_browser_res.content) > 0

def test_research_and_notifications_workflow(client):
    token = get_auth_token(client, "research.test@traitlaw.in")
    headers = {"Authorization": f"Bearer {token}"}

    # Research Query
    res_query = client.post("/api/v1/research/query", headers=headers, json={
        "query": "Limitation period for filing arbitration award challenge under Section 34",
        "jurisdiction": "Supreme Court & Indian High Courts"
    })
    assert res_query.status_code == 200
    record_id = res_query.json()["id"]

    # Toggle save / bookmark
    save_res = client.post(f"/api/v1/research/{record_id}/toggle-save", headers=headers)
    assert save_res.status_code == 200
    assert save_res.json()["saved"] is True

    # Notification generated for research
    notifs_res = client.get("/api/v1/notifications", headers=headers)
    assert notifs_res.status_code == 200
    notifs = notifs_res.json()
    assert len(notifs) >= 1
    notif_id = notifs[0]["id"]

    # Mark single notification as read
    read_res = client.post(f"/api/v1/notifications/{notif_id}/read", headers=headers)
    assert read_res.status_code == 200
    assert read_res.json()["is_read"] is True

    # Mark all read
    all_read = client.post("/api/v1/notifications/mark-all-read", headers=headers)
    assert all_read.status_code == 200
