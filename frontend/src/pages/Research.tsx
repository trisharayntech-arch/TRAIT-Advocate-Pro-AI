import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  Bookmark,
  BookmarkCheck,
  Trash2,
  Scale,
  AlertTriangle,
  History,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { api } from '../services/api';
import { ResearchItem } from '../types';

export const Research: React.FC = () => {
  const [history, setHistory] = useState<ResearchItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<ResearchItem | null>(null);
  const [query, setQuery] = useState('');
  const [jurisdiction, setJurisdiction] = useState(
    'Supreme Court & Indian High Courts'
  );
  const [savedFilter, setSavedFilter] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingHistory, setFetchingHistory] = useState(true);

  const loadHistory = async (savedOnly = false) => {
    try {
      setFetchingHistory(true);
      const data = await api.getResearchHistory(savedOnly);
      setHistory(data);

      if (data.length > 0 && !selectedItem) {
        setSelectedItem(data[0]);
      }
    } catch {
      // Preserve existing behavior.
    } finally {
      setFetchingHistory(false);
    }
  };

  useEffect(() => {
    loadHistory(savedFilter);
  }, [savedFilter]);

  const handleResearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!query.trim() || loading) return;

    setLoading(true);

    try {
      const result = await api.queryResearch(query, jurisdiction);

      setHistory((prev) => [result, ...prev]);
      setSelectedItem(result);
      setQuery('');
    } catch (err: any) {
      alert(err.message || 'Research failed');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSave = async (
    id: string,
    e?: React.MouseEvent
  ) => {
    if (e) e.stopPropagation();

    try {
      const updated = await api.toggleSaveResearch(id);

      setHistory((prev) =>
        prev.map((h) => (h.id === id ? updated : h))
      );

      if (selectedItem?.id === id) {
        setSelectedItem(updated);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to toggle bookmark');
    }
  };

  const handleDelete = async (
    id: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();

    if (window.confirm('Delete this research record?')) {
      try {
        await api.deleteResearch(id);

        const next = history.filter((h) => h.id !== id);
        setHistory(next);

        if (selectedItem?.id === id) {
          setSelectedItem(next[0] || null);
        }
      } catch (err: any) {
        alert(err.message || 'Failed to delete record');
      }
    }
  };

  const inputClass =
    'w-full bg-[#FFF8EC] border border-[#E9DCC6] rounded-xl px-4 py-2.5 text-xs text-[#34452F] placeholder:text-[#A29B87] focus:outline-none focus:ring-2 focus:ring-[#EAA34B]/30 focus:border-[#EAA34B] transition-all';

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-[#34452F] tracking-tight flex items-center gap-2.5">
          <BookOpen className="w-6 h-6 text-[#EAA34B]" />
          Indian Legal Research Studio
        </h1>

        <p className="text-xs text-[#7D806B] mt-1 font-medium">
          Comprehensive synthesis of statutory frameworks, landmark Supreme
          Court & High Court ratios, and limitation rules.
        </p>
      </div>

      {/* Research Query */}
      <div className="bg-[#FFFCF5] rounded-2xl border border-[#E9DCC6] p-5 shadow-sm">
        <form onSubmit={handleResearchSubmit} className="space-y-4">

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-[#34452F] mb-1.5">
                Legal Research Query / Proposition
              </label>

              <input
                type="text"
                required
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. Quashing of criminal proceedings in civil breach under Sec 482 CrPC / Sec 528 BNSS..."
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#34452F] mb-1.5">
                Target Jurisdiction
              </label>

              <select
                value={jurisdiction}
                onChange={(e) => setJurisdiction(e.target.value)}
                className={inputClass}
              >
                <option value="Supreme Court & Indian High Courts">
                  Supreme Court & All High Courts
                </option>
                <option value="Supreme Court of India">
                  Supreme Court of India Only
                </option>
                <option value="High Court of Delhi">
                  Delhi High Court
                </option>
                <option value="High Court of Bombay">
                  Bombay High Court
                </option>
                <option value="NCLAT / NCLT">
                  NCLAT / NCLT (IBC & Companies)
                </option>
                <option value="National Consumer Commission (NCDRC)">
                  NCDRC (Consumer Law)
                </option>
              </select>
            </div>

          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">

            <div className="flex items-center gap-2 text-[11px] text-[#7D806B]">
              <ShieldCheck className="w-4 h-4 text-[#476B3F]" />
              <span>
                Prioritizes Indian Statutes & Supreme Court reporter precedents
              </span>
            </div>

            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="px-5 py-2.5 bg-[#476B3F] hover:bg-[#34452F] text-white text-xs font-bold rounded-xl shadow-md shadow-[#476B3F]/20 transition-all disabled:opacity-50 cursor-pointer flex items-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#F4C36B]" />
              {loading ? 'Synthesizing Precedents...' : 'Execute Research'}
            </button>

          </div>
        </form>
      </div>

      {/* Research History + Memorandum */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[550px]">

        {/* History Sidebar */}
        <div className="lg:col-span-4 bg-[#FFFCF5] rounded-2xl border border-[#E9DCC6] shadow-sm flex flex-col overflow-hidden">

          <div className="p-4 border-b border-[#E9DCC6] flex items-center justify-between bg-[#F8EFDF]">

            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-[#D18A32]" />
              <span className="text-xs font-bold text-[#34452F]">
                Research History
              </span>
            </div>

            <button
              onClick={() => setSavedFilter(!savedFilter)}
              className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                savedFilter
                  ? 'bg-[#EAA34B]/20 text-[#9A641F]'
                  : 'text-[#7D806B] hover:text-[#34452F]'
              }`}
            >
              {savedFilter ? '★ Bookmarked Only' : 'Show All'}
            </button>

          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">

            {fetchingHistory ? (
              <div className="p-8 text-center text-xs text-[#7D806B]">
                Loading research history...
              </div>
            ) : history.length > 0 ? (
              history.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`p-3 rounded-xl cursor-pointer transition-all border ${
                    selectedItem?.id === item.id
                      ? 'bg-[#476B3F]/10 border-[#476B3F] shadow-sm'
                      : 'border-transparent hover:bg-[#F8EFDF]'
                  }`}
                >

                  <div className="flex items-center justify-between gap-2">

                    <span className="text-[10px] font-bold text-[#7D806B] truncate">
                      {item.jurisdiction}
                    </span>

                    <div className="flex items-center gap-1 shrink-0">

                      <button
                        onClick={(e) => handleToggleSave(item.id, e)}
                        className={`p-1 rounded-md transition-colors ${
                          item.saved
                            ? 'text-[#D18A32]'
                            : 'text-[#C8BDA8] hover:text-[#D18A32]'
                        }`}
                        title={item.saved ? 'Remove bookmark' : 'Bookmark'}
                      >
                        {item.saved ? (
                          <BookmarkCheck className="w-3.5 h-3.5" />
                        ) : (
                          <Bookmark className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        onClick={(e) => handleDelete(item.id, e)}
                        className="p-1 rounded-md text-[#A29B87] hover:text-[#D94F1E] transition-colors"
                        title="Delete research"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                    </div>
                  </div>

                  <h4 className="text-xs font-bold text-[#34452F] mt-1 line-clamp-2">
                    {item.query}
                  </h4>

                  <p className="text-[10px] text-[#7D806B] mt-1">
                    {new Date(item.created_at).toLocaleDateString()}
                  </p>

                </div>
              ))
            ) : (
              <div className="p-8 text-center">

                <BookOpen className="w-9 h-9 text-[#D9C9AD] mx-auto mb-3" />

                <p className="text-xs text-[#7D806B] leading-relaxed">
                  No research records yet. Type a proposition above to
                  compile your first legal memorandum.
                </p>

              </div>
            )}

          </div>
        </div>

        {/* Memorandum Viewer */}
        <div className="lg:col-span-8 bg-[#FFFCF5] rounded-2xl border border-[#E9DCC6] shadow-sm flex flex-col overflow-hidden">

          {selectedItem ? (
            <div className="flex-1 flex flex-col">

              {/* Memorandum Header */}
              <div className="p-5 border-b border-[#E9DCC6] flex items-start justify-between gap-4 bg-[#F8EFDF]/60">

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">

                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#34452F] text-[#FFF8EC]">
                      {selectedItem.jurisdiction}
                    </span>

                    <span className="text-[11px] text-[#7D806B]">
                      Compiled on{' '}
                      {new Date(selectedItem.created_at).toLocaleDateString()}
                    </span>

                  </div>

                  <h2 className="text-base font-bold text-[#34452F] leading-snug">
                    {selectedItem.query}
                  </h2>
                </div>

                <button
                  onClick={() => handleToggleSave(selectedItem.id)}
                  className={`shrink-0 p-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    selectedItem.saved
                      ? 'bg-[#EAA34B]/15 border-[#EAA34B]/40 text-[#9A641F]'
                      : 'bg-[#FFFCF5] border-[#E9DCC6] text-[#7D806B] hover:text-[#476B3F]'
                  }`}
                >
                  {selectedItem.saved ? (
                    <BookmarkCheck className="w-3.5 h-3.5" />
                  ) : (
                    <Bookmark className="w-3.5 h-3.5" />
                  )}

                  <span>
                    {selectedItem.saved ? 'Bookmarked' : 'Save'}
                  </span>
                </button>

              </div>

              {/* Verification Warning */}
              <div className="px-5 py-3 bg-[#F8EFDF] border-b border-[#E9DCC6] text-[#79551F] text-[11px] flex items-start gap-2.5">

                <AlertTriangle className="w-3.5 h-3.5 text-[#D18A32] shrink-0 mt-0.5" />

                <span className="leading-relaxed">
                  <strong>Advocate Verification Required:</strong> AI
                  generated propositions and citations must be verified
                  against SCC, AIR, or official High Court case reporters.
                </span>

              </div>

              {/* Research Content */}
              <div className="flex-1 p-6 overflow-y-auto">

                <div className="text-xs leading-relaxed text-[#34452F] whitespace-pre-wrap font-sans space-y-3">
                  {selectedItem.response_content}
                </div>

                {selectedItem.citations && (
                  <div className="mt-6 p-5 rounded-xl bg-[#F8EFDF] border border-[#E9DCC6] text-xs text-[#7D806B]">

                    <span className="font-bold text-[#34452F] block mb-2">
                      Authorities & References
                    </span>

                    <div className="whitespace-pre-wrap leading-relaxed">
                      {selectedItem.citations}
                    </div>

                  </div>
                )}

              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-[#7D806B]">

              <div className="w-16 h-16 rounded-2xl bg-[#EAA34B]/15 flex items-center justify-center mb-4">
                <Scale className="w-9 h-9 text-[#D18A32]" />
              </div>

              <h3 className="text-sm font-bold text-[#34452F]">
                Execute a Legal Research Query
              </h3>

              <p className="text-xs max-w-sm mt-2 leading-relaxed">
                Enter any substantive or procedural proposition to generate
                a statutory analysis and judicial ratio memorandum.
              </p>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};