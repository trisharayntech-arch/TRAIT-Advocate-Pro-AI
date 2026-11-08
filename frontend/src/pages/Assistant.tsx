import React, { useEffect, useState, useRef } from 'react';
import {
  Bot,
  Send,
  Plus,
  Trash2,
  FileText,
  AlertCircle,
  Sparkles,
  Info,
  Scale,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { api } from '../services/api';
import { Conversation, DocumentItem } from '../types';

export const Assistant: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>('');
  const [aiStatus, setAiStatus] = useState<any>(null);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadInitialData = async () => {
    try {
      const [convs, docs, status] = await Promise.all([
        api.getConversations(),
        api.getDocuments(),
        api.getAiStatus(),
      ]);
      setConversations(convs);
      setDocuments(docs);
      setAiStatus(status);
      if (convs.length > 0) {
        setActiveConversation(convs[0]);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages, loading]);

  const handleSendMessage = async (e?: React.FormEvent, customMsg?: string) => {
    if (e) e.preventDefault();
    const msg = customMsg || inputMessage;
    if (!msg.trim() || loading) return;

    setInputMessage('');
    setLoading(true);

    try {
      const updatedConv = await api.sendChatMessage(
        msg,
        activeConversation?.id,
        selectedDocId || undefined
      );

      setActiveConversation(updatedConv);

      // Update conversations list
      setConversations((prev) => {
        const idx = prev.findIndex((c) => c.id === updatedConv.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = updatedConv;
          return next;
        }
        return [updatedConv, ...prev];
      });
    } catch (err: any) {
      alert(err.message || 'Error communicating with Legal Assistant');
    } finally {
      setLoading(false);
    }
  };

  const startNewConversation = () => {
    setActiveConversation(null);
  };

  const handleDeleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Delete this conversation history?')) {
      try {
        await api.deleteConversation(id);
        const nextConvs = conversations.filter((c) => c.id !== id);
        setConversations(nextConvs);
        if (activeConversation?.id === id) {
          setActiveConversation(nextConvs[0] || null);
        }
      } catch (err: any) {
        alert(err.message || 'Failed to delete conversation');
      }
    }
  };

  const quickPrompts = [
    { title: 'Bail Provisions', query: 'What are the principles for grant of anticipatory bail under Section 438 CrPC / Sec 482 BNSS?' },
    { title: 'Section 138 NI Act', query: 'Explain mandatory limitation deadlines for statutory legal notice and complaint filing under Section 138 NI Act.' },
    { title: 'Order 39 Injunction', query: 'What are the three essential tests for grant of ad-interim temporary injunction under Order 39 CPC?' },
    { title: 'Limitation for Debt', query: 'What is the limitation period for filing a commercial suit for recovery of money under the Limitation Act, 1963?' },
  ];

  return (
    <div className="h-[calc(100vh-8.5rem)] flex gap-6 overflow-hidden">
      {/* Conversations History Sidebar */}
      <div className="w-72 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col overflow-hidden shrink-0">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="font-bold text-xs text-[#172033] uppercase tracking-wider flex items-center gap-2">
            <Bot className="w-4 h-4 text-[#2563EB]" />
            Inquiries
          </div>
          <button
            onClick={startNewConversation}
            className="p-1.5 bg-blue-50 hover:bg-blue-100 text-[#2563EB] rounded-lg text-xs font-bold transition-colors cursor-pointer"
            title="Start New Chat"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations.length > 0 ? (
            conversations.map((c) => (
              <div
                key={c.id}
                onClick={() => setActiveConversation(c)}
                className={`p-2.5 rounded-xl text-xs cursor-pointer transition-all flex items-center justify-between group ${
                  activeConversation?.id === c.id
                    ? 'bg-[#101A2C] text-white font-semibold shadow-xs'
                    : 'text-[#172033] hover:bg-slate-50'
                }`}
              >
                <div className="truncate flex-1 pr-2">
                  <div className="truncate">{c.title}</div>
                  <div
                    className={`text-[10px] mt-0.5 ${
                      activeConversation?.id === c.id ? 'text-slate-400' : 'text-[#8290A5]'
                    }`}
                  >
                    {new Date(c.updated_at).toLocaleDateString()}
                  </div>
                </div>
                <button
                  onClick={(e) => handleDeleteConversation(c.id, e)}
                  className={`opacity-0 group-hover:opacity-100 p-1 rounded-md transition-opacity ${
                    activeConversation?.id === c.id
                      ? 'hover:bg-slate-800 text-slate-300'
                      : 'hover:bg-red-50 text-slate-400 hover:text-red-600'
                  }`}
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-xs text-[#8290A5]">
              No past conversations. Ask your first legal inquiry.
            </div>
          )}
        </div>

        {/* Engine Status Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/70 text-[10px] text-[#8290A5]">
          <div className="flex items-center gap-1.5 font-bold text-[#172033]">
            <span
              className={`w-2 h-2 rounded-full ${
                aiStatus?.mode === 'live_ai' ? 'bg-emerald-500' : 'bg-blue-500'
              }`}
            ></span>
            <span>
              {aiStatus?.mode === 'live_ai' ? 'Live Neural Provider' : 'Indian Legal Knowledge Engine'}
            </span>
          </div>
          <div className="mt-0.5">
            {aiStatus?.mode === 'live_ai'
              ? 'Connected to configured Gemini/OpenAI API'
              : 'Built-in statutory jurisprudence fallback'}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
        {/* Chat Header & Document RAG Selector */}
        <div className="px-6 py-3.5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/40">
          <div>
            <h2 className="text-sm font-bold text-[#172033] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#2563EB]" />
              AI Legal Practice Assistant
            </h2>
            <p className="text-[11px] text-[#8290A5]">
              Ground answers on Indian jurisprudence or your uploaded case documents.
            </p>
          </div>

          {/* RAG Document Selector */}
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#8290A5]" />
            <select
              value={selectedDocId}
              onChange={(e) => setSelectedDocId(e.target.value)}
              className="bg-white border border-[#E2E8F0] rounded-xl px-2.5 py-1.5 text-xs text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
            >
              <option value="">RAG: No Document Context</option>
              {documents.map((d) => (
                <option key={d.id} value={d.id}>
                  📄 {d.original_name} ({d.chunk_count} chunks)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {!activeConversation || activeConversation.messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-xl mx-auto py-8">
              <div className="w-14 h-14 rounded-2xl bg-[#101A2C] text-white flex items-center justify-center shadow-lg shadow-blue-500/10 mb-4">
                <Scale className="w-8 h-8 text-[#2563EB]" />
              </div>
              <h3 className="text-base font-bold text-[#172033]">
                TRAIT Advocate Pro AI Legal Assistant
              </h3>
              <p className="text-xs text-[#8290A5] mt-1">
                Ask procedural questions on IPC/BNS, CrPC/BNSS, CPC, Commercial Courts Act, or select an uploaded document to extract case insights.
              </p>

              {/* Quick Prompts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-6 w-full text-left">
                {quickPrompts.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(undefined, p.query)}
                    className="p-3 rounded-xl border border-slate-200 hover:border-[#2563EB] hover:bg-blue-50/40 text-left transition-all cursor-pointer group"
                  >
                    <div className="text-xs font-bold text-[#172033] group-hover:text-[#2563EB]">
                      {p.title}
                    </div>
                    <div className="text-[11px] text-[#8290A5] line-clamp-1 mt-0.5">{p.query}</div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            activeConversation.messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-3 max-w-3xl ${
                  m.role === 'user' ? 'ml-auto justify-end' : 'mr-auto justify-start'
                }`}
              >
                {m.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-xl bg-[#101A2C] text-white flex items-center justify-center shrink-0 text-xs shadow-xs">
                    <Scale className="w-4 h-4 text-[#2563EB]" />
                  </div>
                )}

                <div
                  className={`rounded-2xl p-4 text-xs leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-[#2563EB] text-white font-medium rounded-br-none shadow-md shadow-blue-500/20'
                      : 'bg-[#F5F7FB] border border-[#E2E8F0] text-[#172033] rounded-bl-none shadow-xs whitespace-pre-wrap'
                  }`}
                >
                  {m.content}
                </div>

                {m.role === 'user' && (
                  <div className="w-8 h-8 rounded-xl bg-[#2563EB] text-white flex items-center justify-center shrink-0 font-bold text-xs shadow-xs">
                    Adv
                  </div>
                )}
              </div>
            ))
          )}

          {loading && (
            <div className="flex gap-3 mr-auto max-w-3xl items-center">
              <div className="w-8 h-8 rounded-xl bg-[#101A2C] text-white flex items-center justify-center shrink-0 text-xs animate-pulse">
                <Scale className="w-4 h-4 text-[#2563EB]" />
              </div>
              <div className="bg-[#F5F7FB] border border-[#E2E8F0] rounded-2xl rounded-bl-none px-4 py-3 text-xs text-[#8290A5] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#2563EB] animate-ping"></span>
                <span>Synthesizing legal analysis and statutory precedents...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-100 bg-white">
          <form onSubmit={handleSendMessage} className="flex items-center gap-3">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={
                selectedDocId
                  ? 'Ask a question about the selected document...'
                  : 'Ask legal inquiry (e.g. grounds for quashing FIR, arbitration interim relief)...'
              }
              className="flex-1 bg-[#F5F7FB] border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-xs text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || loading}
              className="px-4 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all disabled:opacity-40 cursor-pointer flex items-center gap-1.5"
            >
              <span>Submit</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
          <div className="text-[10px] text-center text-[#8290A5] mt-2">
            Professional Legal Disclaimer: AI generated responses require advocate review prior to filing.
          </div>
        </div>
      </div>
    </div>
  );
};
