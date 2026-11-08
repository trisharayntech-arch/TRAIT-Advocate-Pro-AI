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
  Filter,
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
      setResults([]);
      setTotalCount(0);
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

    setSearchParams({
      q: query,
      category: selectedCategory,
    });

    executeSearch(query, selectedCategory);
  };

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);

    setSearchParams({
      q: query,
      category: cat,
    });

    executeSearch(query, cat);
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'client':
        return <Users className="h-4 w-4 text-[#476B3F]" />;
      case 'case':
        return <Briefcase className="h-4 w-4 text-[#53602F]" />;
      case 'document':
        return <FileText className="h-4 w-4 text-[#D18A32]" />;
      case 'draft':
        return <PenTool className="h-4 w-4 text-[#D94F1E]" />;
      case 'research':
        return <BookOpen className="h-4 w-4 text-[#9A641F]" />;
      default:
        return <SearchIcon className="h-4 w-4 text-[#7D806B]" />;
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
    <div className="w-full min-w-0 space-y-5 sm:space-y-6">

      {/* PAGE HEADER */}
      <div>
        <h1 className="flex items-center gap-2.5 text-xl font-black tracking-tight text-[#34452F] sm:text-2xl">
          <SearchIcon className="h-6 w-6 shrink-0 text-[#EAA34B]" />
          Unified Global Search
        </h1>

        <p className="mt-1 text-xs font-medium leading-relaxed text-[#7D806B]">
          Instant multi-index query across all clients, litigation dockets,
          documents, legal drafts, and research archives.
        </p>
      </div>

      {/* SEARCH INPUT */}
      <form
        onSubmit={handleSearchSubmit}
        className="flex w-full min-w-0 flex-col gap-2.5 sm:flex-row"
      >
        <div className="relative min-w-0 flex-1">

          <SearchIcon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7D806B]" />

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search keywords, parties, FIR numbers, case titles..."
            aria-label="Search legal records"
            className="w-full rounded-xl border border-[#E9DCC6] bg-[#FFFCF5] py-3 pl-10 pr-4 text-base text-[#34452F] shadow-sm placeholder:text-xs placeholder:text-[#A29B87] focus:border-[#EAA34B] focus:outline-none focus:ring-2 focus:ring-[#EAA34B]/30 sm:text-xs"
          />

        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex min-h-11 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-[#476B3F] px-6 py-3 text-xs font-bold text-white shadow-md shadow-[#476B3F]/20 transition-all hover:bg-[#34452F] disabled:opacity-50 sm:w-auto"
        >
          <SearchIcon className="h-4 w-4 sm:hidden" />
          Search
        </button>

      </form>

      {/* CATEGORY FILTERS */}
      <div className="w-full min-w-0">

        <div className="flex min-w-0 items-center gap-2">

          <Filter className="h-4 w-4 shrink-0 text-[#7D806B]" />

          <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto py-1">

            {categories.map((c) => (

              <button
                key={c.id}
                type="button"
                onClick={() => handleCategoryChange(c.id)}
                aria-pressed={selectedCategory === c.id}
                className={`shrink-0 whitespace-nowrap rounded-xl border px-3.5 py-2.5 text-xs font-bold transition-all ${
                  selectedCategory === c.id
                    ? 'border-[#34452F] bg-[#34452F] text-[#FFF8EC] shadow-sm'
                    : 'border-[#E9DCC6] bg-[#FFFCF5] text-[#7D806B] hover:border-[#EAA34B] hover:bg-[#F8EFDF] hover:text-[#34452F]'
                }`}
              >
                {c.label}
              </button>

            ))}

          </div>

        </div>

        <p className="mt-1 pl-6 text-[10px] text-[#A39B85] sm:hidden">
          Swipe to view all categories →
        </p>

      </div>

      {/* SEARCH RESULTS */}
      <div className="min-w-0 overflow-hidden rounded-2xl border border-[#E9DCC6] bg-[#FFFCF5] shadow-sm">

        {/* RESULTS HEADER */}
        <div className="flex items-center justify-between gap-2 border-b border-[#E9DCC6] bg-[#F8EFDF] px-3 py-4 sm:px-6">

          <span className="min-w-0 break-words text-xs font-bold text-[#34452F]">
            {loading
              ? 'Searching repository...'
              : `${totalCount} Results Found for "${query || ''}"`}
          </span>

          <span className="shrink-0 text-[9px] font-bold uppercase tracking-wider text-[#9A641F] sm:text-[10px]">
            Global Index
          </span>

        </div>

        <div className="divide-y divide-[#E9DCC6]">

          {loading ? (

            <div className="p-12 text-center text-xs text-[#7D806B]">
              Searching and scanning records...
            </div>

          ) : results.length > 0 ? (

            results.map((item, idx) => (

              <button
                type="button"
                key={idx}
                onClick={() => navigate(item.link)}
                className="group flex w-full min-w-0 items-start justify-between gap-3 p-4 text-left transition-colors hover:bg-[#F8EFDF]/70 sm:p-5"
              >

                <div className="flex min-w-0 flex-1 items-start gap-3">

                  <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#E9DCC6] bg-[#F8EFDF]">
                    {getIconForType(item.type)}
                  </div>

                  <div className="min-w-0 flex-1">

                    <div className="flex flex-wrap items-center gap-2">

                      <span className="rounded-md bg-[#476B3F]/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#476B3F]">
                        {item.type}
                      </span>

                      {item.subtitle && (
                        <span className="break-words text-xs font-medium text-[#7D806B]">
                          {item.subtitle}
                        </span>
                      )}

                    </div>

                    <h3 className="mt-1 break-words text-sm font-bold text-[#34452F] transition-colors group-hover:text-[#9A641F]">
                      {item.title}
                    </h3>

                    {item.details && (
                      <p className="mt-1 line-clamp-2 break-words text-xs leading-relaxed text-[#7D806B]">
                        {item.details}
                      </p>
                    )}

                  </div>

                </div>

                <div className="shrink-0 p-2 text-[#A29B87] transition-colors group-hover:text-[#D18A32]">
                  <ArrowRight className="h-4 w-4" />
                </div>

              </button>

            ))

          ) : (

            <div className="px-5 py-16 text-center">

              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F8EFDF]">
                <SearchIcon className="h-8 w-8 text-[#D18A32]" />
              </div>

              <h3 className="text-sm font-bold text-[#34452F]">
                {query
                  ? 'No matching records found'
                  : 'Enter a search term above'}
              </h3>

              <p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-[#7D806B]">
                Search queries match titles, case numbers, notes, extracted
                document text, and client names.
              </p>

            </div>

          )}

        </div>

      </div>

    </div>
  );
};

export default Search;