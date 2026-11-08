import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Search as SearchIcon,
  Users,
  Briefcase,
  FileText,
  PenTool,
  BookOpen,
  ArrowRight,
  Filter
} from 'lucide-react';
import { api } from '../services/api';
import { SearchResultItem } from '../types';

export const Search: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialQuery = searchParams.get('q') || '';
  const initialCategory = searchParams.get('category') || 'all';

  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const executeSearch = async (searchTerm: string, cat: string) => {
    if (!searchTerm.trim()) {
      setResults([]);
      setTotalCount(0);
      return;
    }
    setLoading(true);
    try {
      const res = await api.globalSearch(searchTerm, cat);
      setResults(res.results || []);
      setTotalCount(res.total_results || 0);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      executeSearch(initialQuery, selectedCategory);
    }
  }, [initialQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ q: query, category: selectedCategory });
    executeSearch(query, selectedCategory);
  };

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setSearchParams({ q: query, category: cat });
    executeSearch(query, cat);
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'client':
        return <Users className="w-4 h-4 text-blue-600" />;
      case 'case':
        return <Briefcase className="w-4 h-4 text-emerald-600" />;
      case 'document':
        return <FileText className="w-4 h-4 text-indigo-600" />;
      case 'draft':
        return <PenTool className="w-4 h-4 text-amber-600" />;
      case 'research':
        return <BookOpen className="w-4 h-4 text-violet-600" />;
      default:
        return <SearchIcon className="w-4 h-4 text-slate-500" />;
    }
  };

  const categories = [
    { id: 'all', label: 'All Records' },
    { id: 'clients', label: 'Clients' },
    { id: 'cases', label: 'Cases' },
    { id: 'documents', label: 'Documents' },
    { id: 'drafts', label: 'Drafts' },
    { id: 'research', label: 'Research' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-[#172033] tracking-tight flex items-center gap-2.5">
          <SearchIcon className="w-6 h-6 text-[#2563EB]" />
          Unified Global Search
        </h1>
        <p className="text-xs text-[#8290A5] mt-1 font-medium">
          Instant multi-index query across all clients, litigation dockets, documents, legal drafts, and research archives.
        </p>
      </div>

      {/* Search Input Bar */}
      <form onSubmit={handleSearchSubmit} className="flex gap-3">
        <div className="relative flex-1">
          <SearchIcon className="w-4 h-4 text-[#8290A5] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search keywords, parties, FIR numbers, case titles, or drafted text..."
            className="w-full bg-white border border-[#E2E8F0] rounded-xl pl-10 pr-4 py-3 text-xs text-[#172033] shadow-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
          />
        </div>
        <button
          type="submit"
          className="px-6 py-3 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer"
        >
          Search
        </button>
      </form>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <Filter className="w-3.5 h-3.5 text-[#8290A5] mr-1" />
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => handleCategoryChange(c.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              selectedCategory === c.id
                ? 'bg-[#101A2C] text-white shadow-xs'
                : 'bg-white border border-[#E2E8F0] text-[#8290A5] hover:text-[#172033]'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Results List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <span className="text-xs font-bold text-[#172033]">
            {loading ? 'Searching repository...' : `${totalCount} Results Found for "${query || ''}"`}
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="p-12 text-center text-xs text-[#8290A5]">Indexing and scanning records...</div>
          ) : results.length > 0 ? (
            results.map((item, idx) => (
              <div
                key={idx}
                onClick={() => navigate(item.link)}
                className="p-5 hover:bg-slate-50 transition-colors cursor-pointer flex items-start justify-between group"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                    {getIconForType(item.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-[#172033]">
                        {item.type}
                      </span>
                      {item.subtitle && (
                        <span className="text-xs text-[#8290A5] font-medium">{item.subtitle}</span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-[#172033] mt-1 group-hover:text-[#2563EB] transition-colors">
                      {item.title}
                    </h3>
                    {item.details && (
                      <p className="text-xs text-[#8290A5] mt-1 line-clamp-2">{item.details}</p>
                    )}
                  </div>
                </div>

                <div className="text-[#8290A5] group-hover:text-[#2563EB] p-2 transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16">
              <SearchIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-[#172033]">
                {query ? 'No matching records found' : 'Enter a search term above'}
              </h3>
              <p className="text-xs text-[#8290A5] mt-1 max-w-xs mx-auto">
                Search queries match titles, case numbers, notes, extracted document text, and client names.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
