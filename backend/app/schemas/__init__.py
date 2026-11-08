from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional, List
from datetime import datetime

# Auth / User
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    bar_enrollment_number: Optional[str] = None
    phone: Optional[str] = None
    law_firm: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    bar_enrollment_number: Optional[str] = None
    phone: Optional[str] = None
    law_firm: Optional[str] = None
    current_password: Optional[str] = None
    new_password: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    bar_enrollment_number: Optional[str] = None
    phone: Optional[str] = None
    law_firm: Optional[str] = None
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class TokenData(BaseModel):
    user_id: Optional[str] = None

# Client
class ClientCreate(BaseModel):
    full_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    notes: Optional[str] = None

class ClientUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    notes: Optional[str] = None

class ClientResponse(BaseModel):
    id: str
    user_id: str
    full_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Case
class CaseCreate(BaseModel):
    client_id: Optional[str] = None
    case_number: str
    title: str
    court_name: str
    case_type: Optional[str] = "Civil"
    status: Optional[str] = "Active"
    filing_date: Optional[str] = None
    next_hearing_date: Optional[str] = None
    description: Optional[str] = None

class CaseUpdate(BaseModel):
    client_id: Optional[str] = None
    case_number: Optional[str] = None
    title: Optional[str] = None
    court_name: Optional[str] = None
    case_type: Optional[str] = None
    status: Optional[str] = None
    filing_date: Optional[str] = None
    next_hearing_date: Optional[str] = None
    description: Optional[str] = None

class CaseResponse(BaseModel):
    id: str
    user_id: str
    client_id: Optional[str] = None
    client_name: Optional[str] = None
    case_number: str
    title: str
    court_name: str
    case_type: Optional[str] = None
    status: str
    filing_date: Optional[str] = None
    next_hearing_date: Optional[str] = None
    description: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Document
class DocumentResponse(BaseModel):
    id: str
    user_id: str
    case_id: Optional[str] = None
    client_id: Optional[str] = None
    filename: str
    original_name: str
    file_size: int
    mime_type: Optional[str] = None
    created_at: datetime
    chunk_count: Optional[int] = 0

    model_config = ConfigDict(from_attributes=True)

class DocumentDetailResponse(DocumentResponse):
    extracted_text: Optional[str] = None

# Draft
class DraftGenerateRequest(BaseModel):
    title: str
    draft_type: str  # Legal Notice, Affidavit, Agreement, Application, Client Letter, Custom
    instructions: str
    case_id: Optional[str] = None
    client_id: Optional[str] = None
    parties: Optional[str] = None
    facts: Optional[str] = None
    clauses_or_prayers: Optional[str] = None

class DraftCreate(BaseModel):
    case_id: Optional[str] = None
    client_id: Optional[str] = None
    title: str
    draft_type: str
    content: str
    prompt_used: Optional[str] = None

class DraftUpdate(BaseModel):
    title: Optional[str] = None
    draft_type: Optional[str] = None
    content: Optional[str] = None

class DraftResponse(BaseModel):
    id: str
    user_id: str
    case_id: Optional[str] = None
    client_id: Optional[str] = None
    title: str
    draft_type: str
    content: str
    prompt_used: Optional[str] = None
    disclaimer_acknowledged: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Research
class ResearchQueryRequest(BaseModel):
    query: str
    jurisdiction: Optional[str] = "Supreme Court & Indian High Courts"

class ResearchResponse(BaseModel):
    id: str
    user_id: str
    query: str
    jurisdiction: str
    response_content: str
    citations: Optional[str] = None
    saved: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Assistant / RAG
class ChatMessageRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    document_id: Optional[str] = None

class MessageResponse(BaseModel):
    id: str
    role: str
    content: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ConversationResponse(BaseModel):
    id: str
    title: str
    created_at: datetime
    updated_at: datetime
    messages: List[MessageResponse] = []

    model_config = ConfigDict(from_attributes=True)

# Notifications
class NotificationResponse(BaseModel):
    id: str
    title: str
    message: str
    type: str
    is_read: bool
    link: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Dashboard
class DashboardUpcomingHearing(BaseModel):
    case_id: str
    case_number: str
    title: str
    court_name: str
    next_hearing_date: str
    client_name: Optional[str] = None

class DashboardActivity(BaseModel):
    type: str
    title: str
    description: str
    timestamp: datetime
    link: Optional[str] = None

class DashboardStats(BaseModel):
    total_clients: int
    total_cases: int
    active_cases: int
    closed_cases: int
    total_documents: int
    total_drafts: int
    upcoming_hearings: List[DashboardUpcomingHearing] = []
    recent_activities: List[DashboardActivity] = []

# Search
class GlobalSearchResultItem(BaseModel):
    type: str
    id: str
    title: str
    subtitle: Optional[str] = None
    details: Optional[str] = None
    link: str

class GlobalSearchResponse(BaseModel):
    query: str
    total_results: int
    results: List[GlobalSearchResultItem] = []
