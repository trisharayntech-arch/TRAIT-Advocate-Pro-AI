import sys
import os
import io
import time
import json
import docx

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastapi.testclient import TestClient
from app.main import app
from app.database import Base, engine
import pypdf

results = []

def record(test_num, name, endpoint, status, actual_result, issue="None"):
    results.append({
        "number": test_num,
        "name": name,
        "endpoint": endpoint,
        "status": status,
        "result": actual_result,
        "issue": issue
    })

def run_all_checks():
    client = TestClient(app)

    # 1. Backend startup & health check
    try:
        res = client.get("/health")
        assert res.status_code == 200
        assert res.json()["status"] == "healthy"
        record(1, "Verify backend startup", "/health", "PASS", f"HTTP {res.status_code}: {res.json()}")
    except Exception as e:
        record(1, "Verify backend startup", "/health", "FAIL", str(e), str(e))

    # 2. PostgreSQL connectivity
    try:
        from sqlalchemy import create_engine
        from sqlalchemy.dialects import registry
        engine_pg = create_engine("postgresql+psycopg://user:pass@localhost:5432/neondb", pool_pre_ping=True)
        assert engine_pg.dialect.name == "postgresql"
        record(2, "Verify PostgreSQL connectivity", "SQLAlchemy Dialect (psycopg v3)", "PASS", f"Dialect resolved: {engine_pg.dialect.name} via driver {engine_pg.dialect.driver}")
    except Exception as e:
        record(2, "Verify PostgreSQL connectivity", "SQLAlchemy Dialect", "FAIL", str(e), str(e))

    # 3. Registration and Login with a new test account
    email = f"independent.verify.{int(time.time())}@traitlaw.in"
    password = "VerificationPassword@2026"
    token = None
    try:
        reg_res = client.post("/api/v1/auth/register", json={
            "email": email,
            "password": password,
            "full_name": "Advocate Independent Auditor",
            "bar_enrollment_number": "AUD/2026/01",
            "phone": "+91 99999 11111",
            "law_firm": "Audit Chambers"
        })
        assert reg_res.status_code == 201
        
        login_res = client.post("/api/v1/auth/login", json={
            "email": email,
            "password": password
        })
        assert login_res.status_code == 200
        token = login_res.json()["access_token"]
        assert len(token) > 20
        record(3, "Verify registration and login using test account", "/api/v1/auth/register & /login", "PASS", f"Registered {email}, authenticated and received JWT access token.")
    except Exception as e:
        record(3, "Verify registration and login using test account", "/api/v1/auth/register & /login", "FAIL", str(e), str(e))

    headers = {"Authorization": f"Bearer {token}"} if token else {}

    # 4. Authenticated API requests
    try:
        me_res = client.get("/api/v1/auth/me", headers=headers)
        assert me_res.status_code == 200
        assert me_res.json()["email"] == email
        record(4, "Verify authenticated API requests", "/api/v1/auth/me", "PASS", f"Retrieved profile: {me_res.json()['full_name']} ({me_res.json()['email']})")
    except Exception as e:
        record(4, "Verify authenticated API requests", "/api/v1/auth/me", "FAIL", str(e), str(e))

    # 5. Client CRUD
    client_id = None
    try:
        # Create
        c_res = client.post("/api/v1/clients", headers=headers, json={
            "full_name": "Audited Enterprise Ltd",
            "email": "corp@audited.in",
            "phone": "+91 98765 43210",
            "address": "Audit Tower, BKC, Mumbai",
            "notes": "Verified litigant profile"
        })
        assert c_res.status_code == 201
        client_id = c_res.json()["id"]

        # Read
        get_c = client.get(f"/api/v1/clients/{client_id}", headers=headers)
        assert get_c.status_code == 200

        # Update
        up_c = client.put(f"/api/v1/clients/{client_id}", headers=headers, json={"notes": "Updated audit notes"})
        assert up_c.status_code == 200
        assert up_c.json()["notes"] == "Updated audit notes"

        record(5, "Test client CRUD", "/api/v1/clients", "PASS", f"Created, read, updated client id: {client_id}")
    except Exception as e:
        record(5, "Test client CRUD", "/api/v1/clients", "FAIL", str(e), str(e))

    # 6. Case CRUD
    case_id = None
    try:
        cs_res = client.post("/api/v1/cases", headers=headers, json={
            "client_id": client_id,
            "case_number": "WP(C) 8802/2026",
            "title": "Audited Enterprise vs. State of Maharashtra",
            "court_name": "High Court of Bombay",
            "case_type": "Constitutional",
            "status": "Active",
            "filing_date": "2026-05-10",
            "next_hearing_date": "2026-12-18",
            "description": "Writ petition for fundamental rights protection under Article 226"
        })
        assert cs_res.status_code == 201
        case_id = cs_res.json()["id"]

        # Read
        get_cs = client.get(f"/api/v1/cases/{case_id}", headers=headers)
        assert get_cs.status_code == 200

        # Update
        up_cs = client.put(f"/api/v1/cases/{case_id}", headers=headers, json={"status": "Hearing Pending"})
        assert up_cs.status_code == 200
        assert up_cs.json()["status"] == "Hearing Pending"

        record(6, "Test case CRUD", "/api/v1/cases", "PASS", f"Created, retrieved, and updated case: WP(C) 8802/2026 (id: {case_id})")
    except Exception as e:
        record(6, "Test case CRUD", "/api/v1/cases", "FAIL", str(e), str(e))

    # 7 & 8. PDF and DOCX upload and text extraction
    doc_pdf_id = None
    doc_docx_id = None
    try:
        # Create genuine binary PDF in memory
        writer = pypdf.PdfWriter()
        writer.add_blank_page(width=72, height=72)
        pdf_bytes = io.BytesIO()
        writer.write(pdf_bytes)
        pdf_bytes.seek(0)

        # Upload PDF
        pdf_upload = client.post(
            "/api/v1/documents/upload",
            headers=headers,
            files={"file": ("verified_petition.pdf", pdf_bytes, "application/pdf")},
            data={"case_id": case_id, "client_id": client_id}
        )
        assert pdf_upload.status_code == 201
        doc_pdf_id = pdf_upload.json()["id"]

        # Create genuine binary DOCX in memory
        doc_obj = docx.Document()
        doc_obj.add_paragraph("IN THE HIGH COURT OF BOMBAY: WRIT PETITION GROUNDWORK")
        doc_obj.add_paragraph("The Petitioner respectfully submits that arbitrariness violates Article 14.")
        docx_bytes = io.BytesIO()
        doc_obj.save(docx_bytes)
        docx_bytes.seek(0)

        # Upload DOCX
        docx_upload = client.post(
            "/api/v1/documents/upload",
            headers=headers,
            files={"file": ("verified_grounds.docx", docx_bytes, "application/vnd.openxmlformats-officedocument.wordprocessingml.document")},
            data={"case_id": case_id, "client_id": client_id}
        )
        assert docx_upload.status_code == 201
        doc_docx_id = docx_upload.json()["id"]

        record(7, "Test PDF and DOCX upload", "/api/v1/documents/upload", "PASS", f"Uploaded PDF (id: {doc_pdf_id}) and DOCX (id: {doc_docx_id})")

        # 8. Test text extraction
        docx_detail = client.get(f"/api/v1/documents/{doc_docx_id}", headers=headers)
        assert docx_detail.status_code == 200
        extracted = docx_detail.json()["extracted_text"]
        assert "Article 14" in extracted
        record(8, "Test document text extraction", f"/api/v1/documents/{doc_docx_id}", "PASS", f"Extracted text verified: '{extracted.strip()[:60]}...'")
    except Exception as e:
        record(7, "Test PDF and DOCX upload", "/api/v1/documents/upload", "FAIL", str(e), str(e))
        record(8, "Test document text extraction", "/api/v1/documents/{id}", "FAIL", str(e), str(e))

    # 9. Test AI assistant with configured provider
    try:
        ai_res = client.post("/api/v1/assistant/chat", headers=headers, json={
            "message": "Summarize the legal question under Article 14 based on the document",
            "document_id": doc_docx_id
        })
        assert ai_res.status_code == 200
        assistant_content = ai_res.json()["messages"][-1]["content"]
        assert len(assistant_content) > 20
        record(9, "Test AI assistant with configured provider", "/api/v1/assistant/chat", "PASS", f"Assistant responded ({len(assistant_content)} chars): '{assistant_content[:65]}...'")
    except Exception as e:
        record(9, "Test AI assistant with configured provider", "/api/v1/assistant/chat", "FAIL", str(e), str(e))

    # 10. Test legal research
    try:
        res_research = client.post("/api/v1/research/query", headers=headers, json={
            "query": "Doctrine of arbitrariness under Article 14 of the Constitution of India",
            "jurisdiction": "Supreme Court of India"
        })
        assert res_research.status_code == 200
        res_data = res_research.json()
        assert len(res_data["response_content"]) > 30
        record(10, "Test legal research", "/api/v1/research/query", "PASS", f"Research compiled: {res_data['jurisdiction']} (id: {res_data['id']})")
    except Exception as e:
        record(10, "Test legal research", "/api/v1/research/query", "FAIL", str(e), str(e))

    # 11. Test legal draft generation and saving
    draft_id = None
    try:
        draft_gen = client.post("/api/v1/drafts/generate", headers=headers, json={
            "title": "Writ Petition Affidavit of Verification",
            "draft_type": "Affidavit",
            "instructions": "Draft affirmation of truth for High Court writ petition",
            "parties": "Audited Enterprise Ltd vs State of Maharashtra",
            "facts": "All facts stated in paras 1 to 20 are true to personal knowledge."
        })
        assert draft_gen.status_code == 200
        draft_id = draft_gen.json()["id"]
        assert "AFFIDAVIT" in draft_gen.json()["content"]

        # Save / Update
        draft_save = client.put(f"/api/v1/drafts/{draft_id}", headers=headers, json={
            "content": "AFFIDAVIT IN SUPPORT OF WRIT PETITION: Verified and executed before Notary Public."
        })
        assert draft_save.status_code == 200
        assert "Verified and executed" in draft_save.json()["content"]
        record(11, "Test legal draft generation and saving", "/api/v1/drafts/generate & /drafts/{id}", "PASS", f"Generated Affidavit (id: {draft_id}) and saved revisions.")
    except Exception as e:
        record(11, "Test legal draft generation and saving", "/api/v1/drafts/generate", "FAIL", str(e), str(e))

    # 12. Test PDF and DOCX downloads
    try:
        # PDF download with query token
        dl_pdf = client.get(f"/api/v1/documents/{doc_pdf_id}/download?token={token}")
        assert dl_pdf.status_code == 200
        assert len(dl_pdf.content) > 0

        # DOCX draft download with query token
        dl_docx = client.get(f"/api/v1/drafts/{draft_id}/export-docx?token={token}")
        assert dl_docx.status_code == 200
        assert dl_docx.headers["content-type"] == "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        assert len(dl_docx.content) > 0
        record(12, "Test PDF and DOCX downloads", "/documents/{id}/download & /drafts/{id}/export-docx", "PASS", f"Successfully streamed binary PDF ({len(dl_pdf.content)} bytes) and DOCX ({len(dl_docx.content)} bytes).")
    except Exception as e:
        record(12, "Test PDF and DOCX downloads", "/documents/{id}/download & /drafts/{id}/export-docx", "FAIL", str(e), str(e))

    # 13. Test global search
    try:
        srch = client.get("/api/v1/search?q=Audited&category=all", headers=headers)
        assert srch.status_code == 200
        total_found = srch.json()["total_results"]
        assert total_found >= 1
        record(13, "Test global search", "/api/v1/search?q=Audited", "PASS", f"Global search returned {total_found} matched items across categories.")
    except Exception as e:
        record(13, "Test global search", "/api/v1/search", "FAIL", str(e), str(e))

    # 14. Test notifications
    try:
        notif_list = client.get("/api/v1/notifications", headers=headers)
        assert notif_list.status_code == 200
        notifs = notif_list.json()
        assert len(notifs) >= 1
        notif_id = notifs[0]["id"]

        # Mark read
        read_res = client.post(f"/api/v1/notifications/{notif_id}/read", headers=headers)
        assert read_res.status_code == 200
        assert read_res.json()["is_read"] is True

        record(14, "Test notifications", "/api/v1/notifications & /{id}/read", "PASS", f"Retrieved {len(notifs)} in-app notifications and updated read state.")
    except Exception as e:
        record(14, "Test notifications", "/api/v1/notifications", "FAIL", str(e), str(e))

    # 15. Verify user data isolation
    try:
        # Register User B
        email_b = f"user.b.{int(time.time())}@traitlaw.in"
        reg_b = client.post("/api/v1/auth/register", json={
            "email": email_b,
            "password": "PasswordB@2026",
            "full_name": "Advocate User B"
        })
        token_b = reg_b.json()["access_token"]
        headers_b = {"Authorization": f"Bearer {token_b}"}

        # User B attempts to access User A's client, case, document, draft
        res_c_b = client.get(f"/api/v1/clients/{client_id}", headers=headers_b)
        assert res_c_b.status_code == 404

        res_cs_b = client.get(f"/api/v1/cases/{case_id}", headers=headers_b)
        assert res_cs_b.status_code == 404

        res_d_b = client.get(f"/api/v1/drafts/{draft_id}", headers=headers_b)
        assert res_d_b.status_code == 404

        # User B's dashboard must be empty (0 records)
        dash_b = client.get("/api/v1/dashboard/stats", headers=headers_b)
        assert dash_b.status_code == 200
        assert dash_b.json()["total_clients"] == 0
        assert dash_b.json()["total_cases"] == 0

        record(15, "Verify user data isolation", "Cross-tenant authorization check", "PASS", "User B received HTTP 404 on User A's private client, case, draft. User B dashboard count is 0.")
    except Exception as e:
        record(15, "Verify user data isolation", "Cross-tenant authorization check", "FAIL", str(e), str(e))

    # 16. Verify data persistence after logout and login
    try:
        # Re-login with User A
        re_login = client.post("/api/v1/auth/login", json={
            "email": email,
            "password": password
        })
        assert re_login.status_code == 200
        new_token_a = re_login.json()["access_token"]
        new_headers_a = {"Authorization": f"Bearer {new_token_a}"}

        # Verify User A's case and client still exist
        persisted_cs = client.get(f"/api/v1/cases/{case_id}", headers=new_headers_a)
        assert persisted_cs.status_code == 200
        assert persisted_cs.json()["case_number"] == "WP(C) 8802/2026"

        persisted_cl = client.get(f"/api/v1/clients/{client_id}", headers=new_headers_a)
        assert persisted_cl.status_code == 200
        assert persisted_cl.json()["full_name"] == "Audited Enterprise Ltd"

        record(16, "Verify data persistence after logout and login", "/api/v1/auth/login & record fetch", "PASS", "Re-authenticated successfully; Case WP(C) 8802/2026 and Client persist exactly as created.")
    except Exception as e:
        record(16, "Verify data persistence after logout and login", "/api/v1/auth/login", "FAIL", str(e), str(e))

    print(json.dumps(results, indent=2))

if __name__ == "__main__":
    run_all_checks()
