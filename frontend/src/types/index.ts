export interface User {
  id: string;
  email: string;
  full_name: string;
  bar_enrollment_number?: string;
  phone?: string;
  law_firm?: string;
  is_active: boolean;
  created_at: string;
}

export interface Client {
  id: string;
  user_id: string;
  full_name: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Case {
  id: string;
  user_id: string;
  client_id?: string;
  client_name?: string;
  case_number: string;
  title: string;
  court_name: string;
  case_type?: string;
  status: string;
  filing_date?: string;
  next_hearing_date?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentItem {
  id: string;
  user_id: string;
  case_id?: string;
  client_id?: string;
  filename: string;
  original_name: string;
  file_size: number;
  mime_type?: string;
  created_at: string;
  chunk_count: number;
  extracted_text?: string;
}

export interface DraftItem {
  id: string;
  user_id: string;
  case_id?: string;
  client_id?: string;
  title: string;
  draft_type: string;
  content: string;
  prompt_used?: string;
  disclaimer_acknowledged: boolean;
  created_at: string;
  updated_at: string;
}

export interface ResearchItem {
  id: string;
  user_id: string;
  query: string;
  jurisdiction: string;
  response_content: string;
  citations?: string;
  saved: boolean;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  messages: ChatMessage[];
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  link?: string;
  created_at: string;
}

export interface DashboardStats {
  total_clients: number;
  total_cases: number;
  active_cases: number;
  closed_cases: number;
  total_documents: number;
  total_drafts: number;
  upcoming_hearings: Array<{
    case_id: string;
    case_number: string;
    title: string;
    court_name: string;
    next_hearing_date: string;
    client_name?: string;
  }>;
  recent_activities: Array<{
    type: string;
    title: string;
    description: string;
    timestamp: string;
    link?: string;
  }>;
}

export interface SearchResultItem {
  type: 'client' | 'case' | 'document' | 'draft' | 'research';
  id: string;
  title: string;
  subtitle?: string;
  details?: string;
  link: string;
}
