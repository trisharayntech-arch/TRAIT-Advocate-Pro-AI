from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models import User, Draft, Notification
from app.schemas import DraftCreate, DraftUpdate, DraftResponse, DraftGenerateRequest
from app.services.auth_service import get_current_user, get_current_user_flexible
from app.services.ai_service import generate_draft_content
from app.services.draft_service import create_docx_file

router = APIRouter(prefix="/drafts", tags=["Legal Drafting"])

@router.post("/generate", response_model=DraftResponse)
async def generate_draft(
    draft_req: DraftGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    content = await generate_draft_content(draft_req.model_dump())
    
    draft = Draft(
        user_id=current_user.id,
        case_id=draft_req.case_id,
        client_id=draft_req.client_id,
        title=draft_req.title,
        draft_type=draft_req.draft_type,
        content=content,
        prompt_used=draft_req.instructions,
        disclaimer_acknowledged=True
    )
    db.add(draft)
    
    notif = Notification(
        user_id=current_user.id,
        title="Draft Generated",
        message=f"Legal draft '{draft_req.title}' ({draft_req.draft_type}) generated and ready for professional review.",
        type="system",
        link="/drafting"
    )
    db.add(notif)
    
    db.commit()
    db.refresh(draft)
    return draft

@router.get("", response_model=List[DraftResponse])
def get_drafts(
    draft_type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Draft).filter(Draft.user_id == current_user.id)
    if draft_type and draft_type != "All":
        query = query.filter(Draft.draft_type == draft_type)
    return query.order_by(Draft.updated_at.desc()).all()

@router.post("", response_model=DraftResponse, status_code=status.HTTP_201_CREATED)
def create_draft_manual(
    draft_in: DraftCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    draft = Draft(
        user_id=current_user.id,
        case_id=draft_in.case_id,
        client_id=draft_in.client_id,
        title=draft_in.title,
        draft_type=draft_in.draft_type,
        content=draft_in.content,
        prompt_used=draft_in.prompt_used,
        disclaimer_acknowledged=True
    )
    db.add(draft)
    db.commit()
    db.refresh(draft)
    return draft

@router.get("/{draft_id}", response_model=DraftResponse)
def get_draft(
    draft_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    draft = db.query(Draft).filter(Draft.id == draft_id, Draft.user_id == current_user.id).first()
    if not draft:
        raise HTTPException(status_code=404, detail="Draft not found")
    return draft

@router.put("/{draft_id}", response_model=DraftResponse)
def update_draft(
    draft_id: str,
    draft_in: DraftUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    draft = db.query(Draft).filter(Draft.id == draft_id, Draft.user_id == current_user.id).first()
    if not draft:
        raise HTTPException(status_code=404, detail="Draft not found")

    if draft_in.title is not None:
        draft.title = draft_in.title
    if draft_in.draft_type is not None:
        draft.draft_type = draft_in.draft_type
    if draft_in.content is not None:
        draft.content = draft_in.content

    db.commit()
    db.refresh(draft)
    return draft

@router.get("/{draft_id}/export-docx")
def export_docx(
    draft_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_flexible)
):
    draft = db.query(Draft).filter(
        Draft.id == draft_id,
        Draft.user_id == current_user.id
    ).first()

    if not draft:
        raise HTTPException(status_code=404, detail="Draft not found")

    stream = create_docx_file(
        draft.title,
        draft.content,
        draft.draft_type
    )

    # Generate an ASCII-safe filename to prevent HTTP header errors
    safe_title = "".join(
        char if char.isascii() and (char.isalnum() or char in ("-", "_"))
        else "_"
        for char in draft.title
    ).strip("_")

    safe_filename = f"{safe_title or 'legal_draft'}.docx"

    return StreamingResponse(
        stream,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={
            "Content-Disposition": f'attachment; filename="{safe_filename}"'
        }
    )

@router.delete("/{draft_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_draft(
    draft_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    draft = db.query(Draft).filter(Draft.id == draft_id, Draft.user_id == current_user.id).first()
    if not draft:
        raise HTTPException(status_code=404, detail="Draft not found")
    db.delete(draft)
    db.commit()
    return None
