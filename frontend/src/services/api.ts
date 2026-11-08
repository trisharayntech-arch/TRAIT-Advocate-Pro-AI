const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://commit-universities-landing-des.trycloudflare.com/api/v1';
class ApiClient {
  private getToken(): string | null {
    return localStorage.getItem('advocate_pro_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = this.getToken();

    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(url, {
      ...options,
      headers,
    });

    if (res.status === 401) {
      // If unauthorized, clear token and notify
      localStorage.removeItem('advocate_pro_token');
      localStorage.removeItem('advocate_pro_user');
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
    }

    if (!res.ok) {
      let errorMsg = 'An error occurred';
      try {
        const errData = await res.json();
        errorMsg = errData.detail || errData.message || JSON.stringify(errData);
      } catch {
        errorMsg = res.statusText || `Request failed with status ${res.status}`;
      }
      throw new Error(errorMsg);
    }

    if (res.status === 204) {
      return {} as T;
    }

    return res.json();
  }

  // Auth
  async login(email: string, password: string) {
    return this.request<{ access_token: string; token_type: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(data: { email: string; password: string; full_name: string; bar_enrollment_number?: string; phone?: string; law_firm?: string }) {
    return this.request<{ access_token: string; token_type: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMe() {
    return this.request<any>('/auth/me');
  }

  async updateMe(data: any) {
    return this.request<any>('/auth/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Dashboard
  async getDashboardStats() {
    return this.request<any>('/dashboard/stats');
  }

  // Clients
  async getClients(query?: string) {
    const q = query ? `?q=${encodeURIComponent(query)}` : '';
    return this.request<any[]>(`/clients${q}`);
  }

  async createClient(data: any) {
    return this.request<any>('/clients', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateClient(id: string, data: any) {
    return this.request<any>(`/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteClient(id: string) {
    return this.request<void>(`/clients/${id}`, {
      method: 'DELETE',
    });
  }

  // Cases
  async getCases(query?: string, status?: string) {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (status && status !== 'All') params.append('status', status);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return this.request<any[]>(`/cases${qs}`);
  }

  async createCase(data: any) {
    return this.request<any>('/cases', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCase(id: string, data: any) {
    return this.request<any>(`/cases/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCase(id: string) {
    return this.request<void>(`/cases/${id}`, {
      method: 'DELETE',
    });
  }

  // Documents
  async getDocuments(caseId?: string, clientId?: string) {
    const params = new URLSearchParams();
    if (caseId) params.append('case_id', caseId);
    if (clientId) params.append('client_id', clientId);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return this.request<any[]>(`/documents${qs}`);
  }

  async getDocumentDetail(id: string) {
    return this.request<any>(`/documents/${id}`);
  }

  async uploadDocument(file: File, caseId?: string, clientId?: string) {
    const formData = new FormData();
    formData.append('file', file);
    if (caseId) formData.append('case_id', caseId);
    if (clientId) formData.append('client_id', clientId);

    return this.request<any>('/documents/upload', {
      method: 'POST',
      body: formData,
    });
  }

  async deleteDocument(id: string) {
    return this.request<void>(`/documents/${id}`, {
      method: 'DELETE',
    });
  }

  getDocumentDownloadUrl(id: string) {
    const token = this.getToken();
    return `${API_BASE_URL}/documents/${id}/download?token=${token || ''}`;
  }

  // AI Assistant
  async getAiStatus() {
    return this.request<any>('/assistant/status');
  }

  async getConversations() {
    return this.request<any[]>('/assistant/conversations');
  }

  async getConversation(id: string) {
    return this.request<any>(`/assistant/conversations/${id}`);
  }

  async sendChatMessage(message: string, conversationId?: string, documentId?: string) {
    return this.request<any>('/assistant/chat', {
      method: 'POST',
      body: JSON.stringify({
        message,
        conversation_id: conversationId,
        document_id: documentId,
      }),
    });
  }

  async deleteConversation(id: string) {
    return this.request<void>(`/assistant/conversations/${id}`, {
      method: 'DELETE',
    });
  }

  // Drafts
  async getDrafts(draftType?: string) {
    const qs = draftType && draftType !== 'All' ? `?draft_type=${encodeURIComponent(draftType)}` : '';
    return this.request<any[]>(`/drafts${qs}`);
  }

  async getDraft(id: string) {
    return this.request<any>(`/drafts/${id}`);
  }

  async generateDraft(data: {
    title: string;
    draft_type: string;
    instructions: string;
    case_id?: string;
    client_id?: string;
    parties?: string;
    facts?: string;
    clauses_or_prayers?: string;
  }) {
    return this.request<any>('/drafts/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateDraft(id: string, data: { title?: string; draft_type?: string; content?: string }) {
    return this.request<any>(`/drafts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteDraft(id: string) {
    return this.request<void>(`/drafts/${id}`, {
      method: 'DELETE',
    });
  }

  getDraftDocxUrl(id: string) {
    const token = this.getToken();
    return `${API_BASE_URL}/drafts/${id}/export-docx?token=${token || ''}`;
  }

  // Research
  async queryResearch(query: string, jurisdiction: string) {
    return this.request<any>('/research/query', {
      method: 'POST',
      body: JSON.stringify({ query, jurisdiction }),
    });
  }

  async getResearchHistory(savedOnly: boolean = false) {
    return this.request<any[]>(`/research/history?saved_only=${savedOnly}`);
  }

  async toggleSaveResearch(id: string) {
    return this.request<any>(`/research/${id}/toggle-save`, {
      method: 'POST',
    });
  }

  async deleteResearch(id: string) {
    return this.request<void>(`/research/${id}`, {
      method: 'DELETE',
    });
  }

  // Search
  async globalSearch(q: string, category: string = 'all') {
    return this.request<any>(`/search?q=${encodeURIComponent(q)}&category=${encodeURIComponent(category)}`);
  }

  // Notifications
  async getNotifications() {
    return this.request<any[]>('/notifications');
  }

  async markNotificationRead(id: string) {
    return this.request<any>(`/notifications/${id}/read`, {
      method: 'POST',
    });
  }

  async markAllNotificationsRead() {
    return this.request<any>('/notifications/mark-all-read', {
      method: 'POST',
    });
  }

  // Settings
  async getSystemSettings() {
    return this.request<any>('/settings/system');
  }
}

export const api = new ApiClient();
