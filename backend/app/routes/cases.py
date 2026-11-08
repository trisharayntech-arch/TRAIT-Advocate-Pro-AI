from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models import User, Case, Client, Notification
from app.schemas import CaseCreate, CaseUpdate, CaseResponse
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/cases", tags=["Cases"])

def format_case_response(case: Case) -> CaseResponse:
    client_name = case.client.full_name if case.client else None
    return CaseResponse(
        id=case.id,
        user_id=case.user_id,
        client_id=case.client_id,
        client_name=client_name,
        case_number=case.case_number,
        title=case.title,
        court_name=case.court_name,
        case_type=case.case_type,
        status=case.status,
        filing_date=case.filing_date,
        next_hearing_date=case.next_hearing_date,
        description=case.description,
        created_at=case.created_at,
        updated_at=case.updated_at
    )

@router.get("", response_model=List[CaseResponse])
def get_cases(
    q: Optional[str] = Query(None, description="Search term"),
    status: Optional[str] = Query(None, description="Filter by status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Case).filter(Case.user_id == current_user.id)
    if status and status != "All":
        query = query.filter(Case.status == status)
    if q:
        search_filter = f"%{q}%"
        query = query.filter(
            (Case.title.ilike(search_filter)) |
            (Case.case_number.ilike(search_filter)) |
            (Case.court_name.ilike(search_filter))
        )
    cases = query.order_by(Case.created_at.desc()).all()
    return [format_case_response(c) for c in cases]

@router.post("", response_model=CaseResponse, status_code=status.HTTP_201_CREATED)
def create_case(
    case_in: CaseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if case_in.client_id:
        client = db.query(Client).filter(Client.id == case_in.client_id, Client.user_id == current_user.id).first()
        if not client:
            raise HTTPException(status_code=400, detail="Invalid client ID")

    case = Case(
        user_id=current_user.id,
        client_id=case_in.client_id,
        case_number=case_in.case_number,
        title=case_in.title,
        court_name=case_in.court_name,
        case_type=case_in.case_type,
        status=case_in.status or "Active",
        filing_date=case_in.filing_date,
        next_hearing_date=case_in.next_hearing_date,
        description=case_in.description
    )
    db.add(case)
    
    # Auto-generate notification if next_hearing_date is set
    if case_in.next_hearing_date:
        notif = Notification(
            user_id=current_user.id,
            title="Hearing Scheduled",
            message=f"Upcoming hearing for '{case_in.title}' ({case_in.case_number}) in {case_in.court_name} on {case_in.next_hearing_date}.",
            type="hearing_reminder",
            link="/cases"
        )
        db.add(notif)

    db.commit()
    db.refresh(case)
    return format_case_response(case)

@router.get("/{case_id}", response_model=CaseResponse)
def get_case(
    case_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    case = db.query(Case).filter(Case.id == case_id, Case.user_id == current_user.id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return format_case_response(case)

@router.put("/{case_id}", response_model=CaseResponse)
def update_case(
    case_id: str,
    case_in: CaseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    case = db.query(Case).filter(Case.id == case_id, Case.user_id == current_user.id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    if case_in.client_id is not None:
        if case_in.client_id:
            client = db.query(Client).filter(Client.id == case_in.client_id, Client.user_id == current_user.id).first()
            if not client:
                raise HTTPException(status_code=400, detail="Invalid client ID")
        case.client_id = case_in.client_id or None

    if case_in.case_number is not None:
        case.case_number = case_in.case_number
    if case_in.title is not None:
        case.title = case_in.title
    if case_in.court_name is not None:
        case.court_name = case_in.court_name
    if case_in.case_type is not None:
        case.case_type = case_in.case_type
    if case_in.status is not None:
        case.status = case_in.status
    if case_in.filing_date is not None:
        case.filing_date = case_in.filing_date
    if case_in.next_hearing_date is not None:
        case.next_hearing_date = case_in.next_hearing_date
    if case_in.description is not None:
        case.description = case_in.description

    db.commit()
    db.refresh(case)
    return format_case_response(case)

@router.delete("/{case_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_case(
    case_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    case = db.query(Case).filter(Case.id == case_id, Case.user_id == current_user.id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    db.delete(case)
    db.commit()
    return None
