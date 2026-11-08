from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models import User, ResearchRecord, Notification
from app.schemas import ResearchQueryRequest, ResearchResponse
from app.services.auth_service import get_current_user
from app.services.ai_service import generate_legal_research

router = APIRouter(prefix="/research", tags=["Legal Research"])

@router.post("/query", response_model=ResearchResponse)
async def conduct_research(
    req: ResearchQueryRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await generate_legal_research(req.query, req.jurisdiction)
    
    record = ResearchRecord(
        user_id=current_user.id,
        query=req.query,
        jurisdiction=req.jurisdiction,
        response_content=result["response_content"],
        citations=result.get("citations"),
        saved=False
    )
    db.add(record)
    
    notif = Notification(
        user_id=current_user.id,
        title="Research Completed",
        message=f"Legal research compiled for '{req.query[:45]}...'.",
        type="system",
        link="/research"
    )
    db.add(notif)
    
    db.commit()
    db.refresh(record)
    return record

@router.get("/history", response_model=List[ResearchResponse])
def get_research_history(
    saved_only: Optional[bool] = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(ResearchRecord).filter(ResearchRecord.user_id == current_user.id)
    if saved_only:
        query = query.filter(ResearchRecord.saved == True)
    return query.order_by(ResearchRecord.created_at.desc()).all()

@router.post("/{record_id}/toggle-save", response_model=ResearchResponse)
def toggle_save_research(
    record_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    record = db.query(ResearchRecord).filter(
        ResearchRecord.id == record_id,
        ResearchRecord.user_id == current_user.id
    ).first()
    if not record:
        raise HTTPException(status_code=404, detail="Research record not found")
    
    record.saved = not record.saved
    db.commit()
    db.refresh(record)
    return record

@router.delete("/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_research(
    record_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    record = db.query(ResearchRecord).filter(
        ResearchRecord.id == record_id,
        ResearchRecord.user_id == current_user.id
    ).first()
    if not record:
        raise HTTPException(status_code=404, detail="Research record not found")
    db.delete(record)
    db.commit()
    return None
