import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from app.config import settings
from app.database import get_db
from app.models import User, Document, DocumentChunk, Notification
from app.schemas import DocumentResponse, DocumentDetailResponse
from app.services.auth_service import get_current_user, get_current_user_flexible
from app.services.document_service import is_allowed_file, extract_text_from_file, chunk_text

router = APIRouter(prefix="/documents", tags=["Documents"])

@router.post("/upload", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    case_id: Optional[str] = Form(None),
    client_id: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not is_allowed_file(file.filename):
        raise HTTPException(
            status_code=400,
            detail="Unsupported file format. Please upload PDF, DOCX, or TXT documents."
        )

    ext = os.path.splitext(file.filename)[1].lower()
    stored_filename = f"{uuid.uuid4()}{ext}"
    saved_path = os.path.join(settings.UPLOAD_DIR, stored_filename)

    # Save to disk
    contents = await file.read()
    file_size = len(contents)
    with open(saved_path, "wb") as f:
        f.write(contents)

    # Extract text
    extracted = extract_text_from_file(saved_path, ext)

    # Create document record
    doc = Document(
        user_id=current_user.id,
        case_id=case_id if case_id else None,
        client_id=client_id if client_id else None,
        filename=stored_filename,
        original_name=file.filename,
        file_path=saved_path,
        file_size=file_size,
        mime_type=file.content_type,
        extracted_text=extracted
    )
    db.add(doc)
    db.flush()

    # RAG Chunks creation
    chunks = chunk_text(extracted)
    for idx, c in enumerate(chunks):
        chunk_obj = DocumentChunk(
            document_id=doc.id,
            chunk_index=idx,
            content=c
        )
        db.add(chunk_obj)

    # Activity notification
    notif = Notification(
        user_id=current_user.id,
        title="Document Processed",
        message=f"'{file.filename}' successfully uploaded and indexed for AI intelligence ({len(chunks)} chunks created).",
        type="document_update",
        link="/documents"
    )
    db.add(notif)

    db.commit()
    db.refresh(doc)
    
    return DocumentResponse(
        id=doc.id,
        user_id=doc.user_id,
        case_id=doc.case_id,
        client_id=doc.client_id,
        filename=doc.filename,
        original_name=doc.original_name,
        file_size=doc.file_size,
        mime_type=doc.mime_type,
        created_at=doc.created_at,
        chunk_count=len(chunks)
    )

@router.get("", response_model=List[DocumentResponse])
def get_documents(
    case_id: Optional[str] = None,
    client_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Document).filter(Document.user_id == current_user.id)
    if case_id:
        query = query.filter(Document.case_id == case_id)
    if client_id:
        query = query.filter(Document.client_id == client_id)
    
    docs = query.order_by(Document.created_at.desc()).all()
    results = []
    for d in docs:
        results.append(DocumentResponse(
            id=d.id,
            user_id=d.user_id,
            case_id=d.case_id,
            client_id=d.client_id,
            filename=d.filename,
            original_name=d.original_name,
            file_size=d.file_size,
            mime_type=d.mime_type,
            created_at=d.created_at,
            chunk_count=len(d.chunks)
        ))
    return results

@router.get("/{document_id}", response_model=DocumentDetailResponse)
def get_document_detail(
    document_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    doc = db.query(Document).filter(Document.id == document_id, Document.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    return DocumentDetailResponse(
        id=doc.id,
        user_id=doc.user_id,
        case_id=doc.case_id,
        client_id=doc.client_id,
        filename=doc.filename,
        original_name=doc.original_name,
        file_size=doc.file_size,
        mime_type=doc.mime_type,
        created_at=doc.created_at,
        chunk_count=len(doc.chunks),
        extracted_text=doc.extracted_text
    )

@router.get("/{document_id}/download")
def download_document(
    document_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_flexible)
):
    doc = db.query(Document).filter(Document.id == document_id, Document.user_id == current_user.id).first()
    if not doc or not os.path.exists(doc.file_path):
        raise HTTPException(status_code=404, detail="File not found")
    
    return FileResponse(
        path=doc.file_path,
        filename=doc.original_name,
        media_type=doc.mime_type or "application/octet-stream"
    )

@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(
    document_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    doc = db.query(Document).filter(Document.id == document_id, Document.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Remove file from disk
    if os.path.exists(doc.file_path):
        try:
            os.remove(doc.file_path)
        except OSError:
            pass

    db.delete(doc)
    db.commit()
    return None
