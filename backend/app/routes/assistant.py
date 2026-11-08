from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models import User, Conversation, Message, Document, DocumentChunk
from app.schemas import ChatMessageRequest, ConversationResponse, MessageResponse
from app.services.auth_service import get_current_user
from app.services.ai_service import generate_legal_assistant_response, get_ai_status
from app.services.document_service import search_chunks

router = APIRouter(prefix="/assistant", tags=["AI Legal Assistant"])

@router.get("/status")
def ai_status():
    return get_ai_status()

@router.get("/conversations", response_model=List[ConversationResponse])
def get_conversations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Conversation).filter(
        Conversation.user_id == current_user.id
    ).order_by(Conversation.updated_at.desc()).all()

@router.get("/conversations/{conversation_id}", response_model=ConversationResponse)
def get_conversation(
    conversation_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    conv = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.user_id == current_user.id
    ).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conv

@router.post("/chat", response_model=ConversationResponse)
async def chat_message(
    chat_in: ChatMessageRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    conversation = None
    if chat_in.conversation_id:
        conversation = db.query(Conversation).filter(
            Conversation.id == chat_in.conversation_id,
            Conversation.user_id == current_user.id
        ).first()
    
    if not conversation:
        title = chat_in.message[:40] + ("..." if len(chat_in.message) > 40 else "")
        conversation = Conversation(
            user_id=current_user.id,
            title=title
        )
        db.add(conversation)
        db.flush()

    # Save user message
    user_msg = Message(
        conversation_id=conversation.id,
        role="user",
        content=chat_in.message
    )
    db.add(user_msg)
    db.flush()

    # Document context retrieval (RAG)
    doc_context = None
    if chat_in.document_id:
        doc = db.query(Document).filter(
            Document.id == chat_in.document_id,
            Document.user_id == current_user.id
        ).first()
        if doc:
            chunk_texts = [c.content for c in doc.chunks]
            if chunk_texts:
                top_chunks = search_chunks(chat_in.message, chunk_texts, top_k=3)
                doc_context = "\n---\n".join([c[0] for c in top_chunks])
            elif doc.extracted_text:
                doc_context = doc.extracted_text[:1500]

    # Generate AI response
    ai_result = await generate_legal_assistant_response(
        query=chat_in.message,
        document_context=doc_context
    )

    assistant_msg = Message(
        conversation_id=conversation.id,
        role="assistant",
        content=ai_result["content"]
    )
    db.add(assistant_msg)
    db.commit()
    db.refresh(conversation)
    return conversation

@router.delete("/conversations/{conversation_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_conversation(
    conversation_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    conv = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.user_id == current_user.id
    ).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    db.delete(conv)
    db.commit()
    return None
