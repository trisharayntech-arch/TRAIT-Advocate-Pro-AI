import React, { useEffect, useState, useRef } from 'react';
import {
  Bot,
  Send,
  Plus,
  Trash2,
  FileText,
  Sparkles,
  Scale,
  ShieldCheck,
  Menu,
  X,
  MessageSquare,
  Clock3,
} from 'lucide-react';
import { api } from '../services/api';
import { Conversation, DocumentItem } from '../types';

export const Assistant: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] =
    useState<Conversation | null>(null);

  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedDocId, setSelectedDocId] = useState('');
  const [aiStatus, setAiStatus] = useState<any>(null);

  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

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
      // Preserve the application if initial data cannot be loaded.
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  }, [activeConversation?.messages, loading]);

  const handleSendMessage = async (
    e?: React.FormEvent,
    customMsg?: string
  ) => {
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

      setConversations((prev) => {
        const idx = prev.findIndex(
          (c) => c.id === updatedConv.id
        );

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
    setShowHistory(false);
    setInputMessage('');
  };

  const handleDeleteConversation = async (
    id: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();

    if (!window.confirm('Delete this conversation history?')) {
      return;
    }

    try {
      await api.deleteConversation(id);

      const nextConvs = conversations.filter(
        (c) => c.id !== id
      );

      setConversations(nextConvs);

      if (activeConversation?.id === id) {
        setActiveConversation(nextConvs[0] || null);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete conversation');
    }
  };

  const selectConversation = (conversation: Conversation) => {
    setActiveConversation(conversation);
    setShowHistory(false);
  };

  const quickPrompts = [
    {
      title: 'Bail Provisions',
      query:
        'What are the principles for grant of anticipatory bail under Section 438 CrPC / Sec 482 BNSS?',
    },
    {
      title: 'Section 138 NI Act',
      query:
        'Explain mandatory limitation deadlines for statutory legal notice and complaint filing under Section 138 NI Act.',
    },
    {
      title: 'Order 39 Injunction',
      query:
        'What are the three essential tests for grant of ad-interim temporary injunction under Order 39 CPC?',
    },
    {
      title: 'Limitation for Debt',
      query:
        'What is the limitation period for filing a commercial suit for recovery of money under the Limitation Act, 1963?',
    },
  ];

  // Conversation history panel
  const ConversationHistory = () => (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-[#E9DCC6] bg-[#FFFCF5] shadow-sm">

      <div className="flex items-center justify-between border-b border-[#E9DCC6] bg-[#F8EFDF] p-4">

        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#34452F]">
          <Bot className="h-4 w-4 text-[#53602F]" />
          Inquiries
        </div>

        <div className="flex items-center gap-2">

          <button
            type="button"
            onClick={startNewConversation}
            title="Start New Chat"
            aria-label="Start new conversation"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EAA34B]/20 text-[#53602F] transition-colors hover:bg-[#EAA34B]/40"
          >
            <Plus className="h-4 w-4" />
          </button>

          {/* Close history on mobile */}
          <button
            type="button"
            onClick={() => setShowHistory(false)}
            aria-label="Close conversation history"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#53602F] hover:bg-[#EAA34B]/20 md:hidden"
          >
            <X className="h-4 w-4" />
          </button>

        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 space-y-1 overflow-y-auto overscroll-contain p-2">

        {conversations.length > 0 ? (

          conversations.map((c) => (

            <div
              key={c.id}
              onClick={() => selectConversation(c)}
              className={`group flex cursor-pointer items-center justify-between gap-2 rounded-xl p-3 text-xs transition-all ${
                activeConversation?.id === c.id
                  ? 'bg-[#476B3F] font-semibold text-[#FFF8EC] shadow-sm'
                  : 'text-[#34452F] hover:bg-[#F8EFDF]'
              }`}
            >

              <div className="min-w-0 flex-1">

                <div className="truncate">
                  {c.title}
                </div>

                <div
                  className={`mt-1 flex items-center gap-1 text-[10px] ${
                    activeConversation?.id === c.id
                      ? 'text-[#E5E8D9]'
                      : 'text-[#7D806B]'
                  }`}
                >
                  <Clock3 className="h-3 w-3" />

                  {new Date(c.updated_at).toLocaleDateString()}
                </div>

              </div>

              <button
                type="button"
                onClick={(e) =>
                  handleDeleteConversation(c.id, e)
                }
                aria-label="Delete conversation"
                title="Delete Conversation"
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                  activeConversation?.id === c.id
                    ? 'text-[#FFF8EC] hover:bg-[#34452F]'
                    : 'text-[#7D806B] hover:bg-[#FCEAE3] hover:text-[#C84632]'
                }`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>

            </div>

          ))

        ) : (

          <div className="px-5 py-10 text-center text-xs text-[#7D806B]">
            <MessageSquare className="mx-auto mb-3 h-7 w-7 opacity-40" />

            No past conversations.

            <p className="mt-1">
              Ask your first legal inquiry.
            </p>
          </div>

        )}

      </div>

      {/* AI STATUS */}
      <div className="border-t border-[#E9DCC6] bg-[#F8EFDF] p-3 text-[10px] text-[#7D806B]">

        <div className="flex items-center gap-2 font-bold text-[#34452F]">

          <span
            className={`h-2 w-2 rounded-full ${
              aiStatus?.mode === 'live_ai'
                ? 'bg-[#476B3F]'
                : 'bg-[#D18A32]'
            }`}
          />

          {aiStatus?.mode === 'live_ai'
            ? 'Live Neural Provider'
            : 'Indian Legal Knowledge Engine'}

        </div>

        <div className="mt-1">
          {aiStatus?.mode === 'live_ai'
            ? 'Connected to configured Gemini/OpenAI API'
            : 'Built-in statutory jurisprudence fallback'}
        </div>

      </div>

    </div>
  );

  return (
    <div className="relative flex h-[calc(100dvh-7.5rem)] min-h-[480px] w-full min-w-0 gap-4 overflow-hidden">

      {/* DESKTOP CONVERSATION HISTORY */}
      <div className="hidden w-64 shrink-0 md:block lg:w-72">
        <ConversationHistory />
      </div>

      {/* MOBILE HISTORY DRAWER */}
      {showHistory && (
        <div className="fixed inset-0 z-50 md:hidden">

          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowHistory(false)}
          />

          <div className="absolute bottom-3 left-3 top-20 w-[min(19rem,calc(100vw-1.5rem))] animate-in slide-in-from-left duration-200">
            <ConversationHistory />
          </div>

        </div>
      )}

      {/* MAIN CHAT AREA */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-[#E9DCC6] bg-[#FFFCF5] shadow-sm">

        {/* CHAT HEADER */}
        <div className="flex shrink-0 flex-col gap-3 border-b border-[#E9DCC6] bg-[#F8EFDF] px-3 py-3 sm:px-5 sm:py-4">

          <div className="flex min-w-0 items-center gap-3">

            {/* Mobile History Button */}
            <button
              type="button"
              onClick={() => setShowHistory(true)}
              aria-label="Open conversation history"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#E9DCC6] bg-[#FFFCF5] text-[#53602F] transition-colors hover:bg-[#EAA34B]/20 md:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="min-w-0 flex-1">

              <h2 className="flex items-center gap-2 text-sm font-bold text-[#34452F] sm:text-base">

                <Sparkles className="h-4 w-4 shrink-0 text-[#D18A32]" />

                <span className="truncate">
                  AI Legal Practice Assistant
                </span>

              </h2>

              <p className="mt-1 hidden text-[11px] text-[#7D806B] sm:block">
                Ground answers on Indian jurisprudence or your uploaded case documents.
              </p>

              <p className="mt-1 text-[10px] text-[#7D806B] sm:hidden">
                Your intelligent legal workspace
              </p>

            </div>

            {/* New Conversation */}
            <button
              type="button"
              onClick={startNewConversation}
              title="New conversation"
              aria-label="Start new conversation"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EAA34B]/20 text-[#53602F] transition-colors hover:bg-[#EAA34B]/40 md:hidden"
            >
              <Plus className="h-5 w-5" />
            </button>

          </div>

          {/* DOCUMENT SELECTOR */}
          <div className="flex min-w-0 items-center gap-2">

            <FileText className="h-4 w-4 shrink-0 text-[#53602F]" />

            <select
              value={selectedDocId}
              onChange={(e) => setSelectedDocId(e.target.value)}
              aria-label="Select legal document context"
              className="min-w-0 flex-1 rounded-xl border border-[#E9DCC6] bg-[#FFFCF5] px-3 py-2 text-xs text-[#34452F] focus:border-[#53602F] focus:outline-none focus:ring-2 focus:ring-[#EAA34B]/30"
            >

              <option value="">
                RAG: No Document Context
              </option>

              {documents.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.original_name} ({d.chunk_count} chunks)
                </option>
              ))}

            </select>

          </div>

        </div>

        {/* CHAT MESSAGES */}
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain p-3 sm:p-5 md:p-6">

          {!activeConversation ||
          activeConversation.messages.length === 0 ? (

            <div className="mx-auto flex min-h-full w-full max-w-xl flex-col items-center justify-center py-6 text-center">

              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#476B3F] text-[#FFF8EC] shadow-lg shadow-[#476B3F]/20">
                <Scale className="h-8 w-8 text-[#EAA34B]" />
              </div>

              <h3 className="text-sm font-bold text-[#34452F] sm:text-base">
                TRAIT Advocate Pro AI Legal Assistant
              </h3>

              <p className="mt-2 max-w-md text-xs leading-relaxed text-[#7D806B]">
                Ask procedural questions on IPC/BNS, CrPC/BNSS,
                CPC, Commercial Courts Act, or select an uploaded
                document to extract case insights.
              </p>

              {/* QUICK PROMPTS */}
              <div className="mt-6 grid w-full grid-cols-1 gap-2.5 text-left sm:grid-cols-2">

                {quickPrompts.map((p, idx) => (

                  <button
                    type="button"
                    key={idx}
                    onClick={() =>
                      handleSendMessage(undefined, p.query)
                    }
                    disabled={loading}
                    className="rounded-xl border border-[#E9DCC6] p-3 text-left transition-all hover:border-[#53602F] hover:bg-[#F8EFDF] disabled:opacity-50"
                  >

                    <div className="text-xs font-bold text-[#34452F]">
                      {p.title}
                    </div>

                    <div className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-[#7D806B]">
                      {p.query}
                    </div>

                  </button>

                ))}

              </div>

            </div>

          ) : (

            activeConversation.messages.map((m) => (

              <div
                key={m.id}
                className={`flex w-full min-w-0 gap-2 sm:gap-3 ${
                  m.role === 'user'
                    ? 'justify-end'
                    : 'justify-start'
                }`}
              >

                {m.role === 'assistant' && (

                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#476B3F] text-[#FFF8EC] shadow-sm">
                    <Scale className="h-4 w-4 text-[#EAA34B]" />
                  </div>

                )}

                <div
                  className={`max-w-[85%] min-w-0 break-words rounded-2xl p-3 text-xs leading-relaxed sm:max-w-[80%] sm:p-4 ${
                    m.role === 'user'
                      ? 'rounded-br-none bg-[#476B3F] font-medium text-[#FFF8EC] shadow-md'
                      : 'whitespace-pre-wrap rounded-bl-none border border-[#E9DCC6] bg-[#F8EFDF] text-[#34452F] shadow-sm'
                  }`}
                >
                  {m.content}
                </div>

                {m.role === 'user' && (

                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#EAA34B] text-xs font-bold text-[#34452F] shadow-sm">
                    Adv
                  </div>

                )}

              </div>

            ))

          )}

          {/* LOADING INDICATOR */}
          {loading && (

            <div className="flex max-w-full items-center gap-2 sm:gap-3">

              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#476B3F] text-[#FFF8EC]">
                <Scale className="h-4 w-4 text-[#EAA34B]" />
              </div>

              <div className="flex min-w-0 items-center gap-2 rounded-2xl rounded-bl-none border border-[#E9DCC6] bg-[#F8EFDF] px-3 py-3 text-[11px] text-[#7D806B] sm:text-xs">

                <span className="h-2 w-2 shrink-0 animate-ping rounded-full bg-[#D18A32]" />

                <span>
                  Synthesizing legal analysis...
                </span>

              </div>

            </div>

          )}

          <div ref={messagesEndRef} />

        </div>

        {/* MESSAGE INPUT */}
        <div className="shrink-0 border-t border-[#E9DCC6] bg-[#FFFCF5] p-3 sm:p-4">

          <form
            onSubmit={handleSendMessage}
            className="flex items-center gap-2 sm:gap-3"
          >

            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={
                selectedDocId
                  ? 'Ask about selected document...'
                  : 'Ask your legal question...'
              }
              aria-label="Enter your legal question"
              className="min-w-0 flex-1 rounded-xl border border-[#E9DCC6] bg-[#FFF8EC] px-3 py-3 text-base text-[#34452F] placeholder:text-xs placeholder:text-[#9B9B83] focus:border-[#53602F] focus:outline-none focus:ring-2 focus:ring-[#EAA34B]/30 sm:px-4 sm:text-sm"
            />

            <button
              type="submit"
              disabled={!inputMessage.trim() || loading}
              aria-label="Send message"
              className="flex h-11 w-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#D94F1E] text-white shadow-md transition-all hover:bg-[#BD4118] disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto sm:px-4"
            >

              <Send className="h-4 w-4" />

              <span className="hidden text-xs font-bold sm:inline">
                Submit
              </span>

            </button>

          </form>

          <div className="mt-2 flex items-center justify-center gap-1 text-center text-[9px] leading-relaxed text-[#A39B85] sm:text-[10px]">

            <ShieldCheck className="h-3 w-3 shrink-0" />

            <span>
              AI-generated responses require advocate review before filing.
            </span>

          </div>

        </div>

      </div>

    </div>
  );
};

export default Assistant;