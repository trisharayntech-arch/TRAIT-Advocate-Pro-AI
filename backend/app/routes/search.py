from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models import User, Client, Case, Document, Draft, ResearchRecord
from app.schemas import GlobalSearchResponse, GlobalSearchResultItem
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/search", tags=["Global Search"])

@router.get("", response_model=GlobalSearchResponse)
def search_all(
    q: str = Query(..., min_length=1, description="Global search query"),
    category: Optional[str] = Query("all", description="all, clients, cases, documents, drafts, research"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    uid = current_user.id
    term = f"%{q.strip()}%"
    results: List[GlobalSearchResultItem] = []

    # 1. Clients
    if category in ["all", "clients"]:
        clients = db.query(Client).filter(
            Client.user_id == uid,
            (Client.full_name.ilike(term)) | (Client.email.ilike(term)) | (Client.phone.ilike(term))
        ).limit(10).all()
        for cl in clients:
            results.append(GlobalSearchResultItem(
                type="client",
                id=cl.id,
                title=cl.full_name,
                subtitle=cl.phone or cl.email or "Client Contact",
                details=cl.notes[:100] if cl.notes else None,
                link="/clients"
            ))

    # 2. Cases
    if category in ["all", "cases"]:
        cases = db.query(Case).filter(
            Case.user_id == uid,
            (Case.title.ilike(term)) | (Case.case_number.ilike(term)) | (Case.court_name.ilike(term))
        ).limit(10).all()
        for cs in cases:
            results.append(GlobalSearchResultItem(
                type="case",
                id=cs.id,
                title=f"{cs.case_number} — {cs.title}",
                subtitle=f"{cs.court_name} • Status: {cs.status}",
                details=f"Hearing: {cs.next_hearing_date}" if cs.next_hearing_date else None,
                link="/cases"
            ))

    # 3. Documents
    if category in ["all", "documents"]:
        docs = db.query(Document).filter(
            Document.user_id == uid,
            (Document.original_name.ilike(term)) | (Document.extracted_text.ilike(term))
        ).limit(10).all()
        for dc in docs:
            results.append(GlobalSearchResultItem(
                type="document",
                id=dc.id,
                title=dc.original_name,
                subtitle=f"Size: {round(dc.file_size / 1024, 1)} KB",
                details=dc.extracted_text[:120] if dc.extracted_text else None,
                link="/documents"
            ))

    # 4. Drafts
    if category in ["all", "drafts"]:
        drafts = db.query(Draft).filter(
            Draft.user_id == uid,
            (Draft.title.ilike(term)) | (Draft.content.ilike(term))
        ).limit(10).all()
        for df in drafts:
            results.append(GlobalSearchResultItem(
                type="draft",
                id=df.id,
                title=df.title,
                subtitle=f"Type: {df.draft_type}",
                details=df.content[:120] if df.content else None,
                link="/drafting"
            ))

    # 5. Research
    if category in ["all", "research"]:
        researches = db.query(ResearchRecord).filter(
            ResearchRecord.user_id == uid,
            (ResearchRecord.query.ilike(term)) | (ResearchRecord.response_content.ilike(term))
        ).limit(10).all()
        for rs in researches:
            results.append(GlobalSearchResultItem(
                type="research",
                id=rs.id,
                title=rs.query,
                subtitle=f"Jurisdiction: {rs.jurisdiction}",
                details=rs.response_content[:120] if rs.response_content else None,
                link="/research"
            ))

    return GlobalSearchResponse(
        query=q,
        total_results=len(results),
        results=results
    )
