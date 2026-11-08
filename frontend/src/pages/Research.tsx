import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  Search,
  Bookmark,
  BookmarkCheck,
  Trash2,
  Scale,
  Building,
  AlertTriangle,
  History,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';
import { ResearchItem } from '../types';

export const Research: React.FC = () => {
  const [history, setHistory] = useState<ResearchItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<ResearchItem | null>(null);
  const [query, setQuery] = useState('');
  const [jurisdiction, setJurisdiction] = useState('Supreme Court & Indian High Courts');
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
      // ignore
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
      setHistory([result, ...history]);
      setSelectedItem(result);
      setQuery('');
    } catch (err: any) {
      alert(err.message || 'Research failed');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSave = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const updated = await api.toggleSaveResearch(id);
      setHistory(history.map((h) => (h.id === id ? updated : h)));
      if (selectedItem?.id === id) {
        setSelectedItem(updated);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to toggle bookmark');
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-[#172033] tracking-tight flex items-center gap-2.5">
          <BookOpen className="w-6 h-6 text-[#2563EB]" />
          Indian Legal Research Studio
        </h1>
        <p className="text-xs text-[#8290A5] mt-1 font-medium">
          Comprehensive synthesis of statutory frameworks, landmark Supreme Court & High Court ratios, and limitation rules.
        </p>
      </div>

      {/* Query Bar & Jurisdiction Selector */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <form onSubmit={handleResearchSubmit} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-[#172033] mb-1">
                Legal Research Query / Proposition
              </label>
              <input
                type="text"
                required
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. Quashing of criminal proceedings in civil breach under Sec 482 CrPC / Sec 528 BNSS..."
                className="w-full bg-[#F5F7FB] border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-xs text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#172033] mb-1">
                Target Jurisdiction
              </label>
              <select
                value={jurisdiction}
                onChange={(e) => setJurisdiction(e.target.value)}
                className="w-full bg-[#F5F7FB] border border-[#E2E8F0] rounded-xl px-3 py-2.5 text-xs text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
              >
                <option value="Supreme Court & Indian High Courts">Supreme Court & All High Courts</option>
                <option value="Supreme Court of India">Supreme Court of India Only</option>
                <option value="High Court of Delhi">Delhi High Court</option>
                <option value="High Court of Bombay">Bombay High Court</option>
                <option value="NCLAT / NCLT">NCLAT / NCLT (IBC & Companies)</option>
                <option value="National Consumer Commission (NCDRC)">NCDRC (Consumer Law)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5 text-[11px] text-[#8290A5]">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Prioritizes Indian Statutes & Supreme Court reporter precedents</span>
            </div>
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="px-5 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all disabled:opacity-50 cursor-pointer flex items-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {loading ? 'Synthesizing Precedents...' : 'Execute Research'}
            </button>
          </div>
        </form>
      </div>

      {/* Two-Column Research History & Memorandum Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[550px]">
        {/* Left History Column */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
          <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <History className="w-3.5 h-3.5 text-[#8290A5]" />
              <span className="text-xs font-bold text-[#172033]">History</span>
            </div>
            <button
              onClick={() => setSavedFilter(!savedFilter)}
              className={`text-[11px] font-bold px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                savedFilter
                  ? 'bg-blue-100 text-[#2563EB]'
                  : 'text-[#8290A5] hover:text-[#172033]'
              }`}
            >
              {savedFilter ? '★ Bookmarked Only' : 'Show All'}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {fetchingHistory ? (
              <div className="p-8 text-center text-xs text-[#8290A5]">Loading research history...</div>
            ) : history.length > 0 ? (
              history.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`p-3 rounded-xl cursor-pointer transition-all border ${
                    selectedItem?.id === item.id
                      ? 'bg-blue-50/60 border-[#2563EB] shadow-xs'
                      : 'border-transparent hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#8290A5] truncate max-w-[160px]">
                      {item.jurisdiction}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => handleToggleSave(item.id, e)}
                        className={`p-1 rounded-md ${
                          item.saved ? 'text-amber-500' : 'text-slate-300 hover:text-amber-500'
                        }`}
                      >
                        {item.saved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={(e) => handleDelete(item.id, e)}
                        className="p-1 rounded-md text-slate-300 hover:text-red-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <h4 className="text-xs font-bold text-[#172033] mt-1 line-clamp-2">{item.query}</h4>
                  <p className="text-[10px] text-[#8290A5] mt-1">
                    {new Date(item.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-[#8290A5]">
                No research records yet. Type a proposition above to compile your first legal memorandum.
              </div>
            )}
          </div>
        </div>

        {/* Right Memorandum Viewer */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
          {selectedItem ? (
            <div className="flex-1 flex flex-col">
              <div className="p-5 border-b border-slate-100 flex items-start justify-between bg-slate-50/40">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#101A2C] text-white">
                      {selectedItem.jurisdiction}
                    </span>
                    <span className="text-[11px] text-[#8290A5]">
                      Compiled on {new Date(selectedItem.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-[#172033]">{selectedItem.query}</h2>
                </div>
                <button
                  onClick={() => handleToggleSave(selectedItem.id)}
                  className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    selectedItem.saved
                      ? 'bg-amber-50 border-amber-200 text-amber-700'
                      : 'bg-white border-slate-200 text-[#8290A5] hover:text-[#172033]'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>{selectedItem.saved ? 'Bookmarked' : 'Save'}</span>
                </button>
              </div>

              {/* Research Warning */}
              <div className="px-5 py-2.5 bg-amber-50/70 border-b border-amber-100 text-amber-800 text-[11px] flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>
                  <strong>Advocate Verification Required:</strong> AI generated propositions and citations must be verified against SCC, AIR, or official High Court case reporters.
                </span>
              </div>

              {/* Content Body */}
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="text-xs leading-relaxed text-[#172033] whitespace-pre-wrap font-sans space-y-3">
                  {selectedItem.response_content}
                </div>

                {selectedItem.citations && (
                  <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#8290A5]">
                    <span className="font-bold text-[#172033] block mb-1">Authorities & References:</span>
                    {selectedItem.citations}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-[#8290A5]">
              <Scale className="w-12 h-12 text-slate-300 mb-3" />
              <h3 className="text-sm font-bold text-[#172033]">Execute a Legal Research Query</h3>
              <p className="text-xs max-w-sm mt-1">
                Enter any substantive or procedural proposition to generate a statutory analysis and judicial ratio memorandum.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
