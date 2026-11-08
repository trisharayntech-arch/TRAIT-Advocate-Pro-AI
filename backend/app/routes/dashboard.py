from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime
from app.database import get_db
from app.models import User, Client, Case, Document, Draft, Notification
from app.schemas import DashboardStats, DashboardUpcomingHearing, DashboardActivity
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user_id = current_user.id

    total_clients = db.query(Client).filter(Client.user_id == user_id).count()
    total_cases = db.query(Case).filter(Case.user_id == user_id).count()
    active_cases = db.query(Case).filter(Case.user_id == user_id, Case.status == "Active").count()
    closed_cases = db.query(Case).filter(Case.user_id == user_id, Case.status.in_(["Closed", "Disposed", "Decided"])).count()
    total_documents = db.query(Document).filter(Document.user_id == user_id).count()
    total_drafts = db.query(Draft).filter(Draft.user_id == user_id).count()

    # Real upcoming hearings
    cases_with_hearings = db.query(Case).filter(
        Case.user_id == user_id,
        Case.next_hearing_date.isnot(None),
        Case.next_hearing_date != ""
    ).order_by(Case.next_hearing_date.asc()).limit(6).all()

    upcoming_hearings = []
    for c in cases_with_hearings:
        upcoming_hearings.append(DashboardUpcomingHearing(
            case_id=c.id,
            case_number=c.case_number,
            title=c.title,
            court_name=c.court_name,
            next_hearing_date=c.next_hearing_date,
            client_name=c.client.full_name if c.client else None
        ))

    # Real recent notifications / activities
    notifs = db.query(Notification).filter(
        Notification.user_id == user_id
    ).order_by(Notification.created_at.desc()).limit(8).all()

    recent_activities = []
    for n in notifs:
        recent_activities.append(DashboardActivity(
            type=n.type,
            title=n.title,
            description=n.message,
            timestamp=n.created_at,
            link=n.link
        ))

    return DashboardStats(
        total_clients=total_clients,
        total_cases=total_cases,
        active_cases=active_cases,
        closed_cases=closed_cases,
        total_documents=total_documents,
        total_drafts=total_drafts,
        upcoming_hearings=upcoming_hearings,
        recent_activities=recent_activities
    )
