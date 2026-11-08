import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Briefcase,
  Plus,
  Search,
  Edit2,
  Trash2,
  Clock,
  Building2,
  AlertCircle,
  CalendarDays,
  User,
  X,
} from 'lucide-react';
import { api } from '../services/api';
import { Case, Client } from '../types';
import { Modal } from '../components/Modal';

export const Cases: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [cases, setCases] = useState<Case[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<Case | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    client_id: '',
    case_number: '',
    title: '',
    court_name: '',
    case_type: 'Civil',
    status: 'Active',
    filing_date: '',
    next_hearing_date: '',
    description: '',
  });

  // Load cases and clients
  const loadData = async (query?: string, status?: string) => {
    try {
      setLoading(true);
      setError(null);

      const [casesData, clientsData] = await Promise.all([
        api.getCases(query, status),
        api.getClients(),
      ]);

      setCases(casesData);
      setClients(clientsData);
    } catch (err: any) {
      setError(err.message || 'Failed to load case data');
    } finally {
      setLoading(false);
    }
  };

  // Initial loading and quick-action handling
  useEffect(() => {
    loadData();

    if (searchParams.get('action') === 'new') {
      openCreateModal();

      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete('action');
      setSearchParams(nextParams, { replace: true });
    }
  }, []);

  // Status filtering
  const handleFilter = (status: string) => {
    setSelectedStatus(status);
    loadData(searchQuery, status);
  };

  // Case search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadData(searchQuery, selectedStatus);
  };

  // Create case
  const openCreateModal = () => {
    setEditingCase(null);

    setFormData({
      client_id: '',
      case_number: '',
      title: '',
      court_name: 'High Court of Delhi',
      case_type: 'Civil',
      status: 'Active',
      filing_date: new Date().toISOString().split('T')[0],
      next_hearing_date: '',
      description: '',
    });

    setIsModalOpen(true);
  };

  // Edit case
  const openEditModal = (c: Case) => {
    setEditingCase(c);

    setFormData({
      client_id: c.client_id || '',
      case_number: c.case_number,
      title: c.title,
      court_name: c.court_name,
      case_type: c.case_type || 'Civil',
      status: c.status,
      filing_date: c.filing_date || '',
      next_hearing_date: c.next_hearing_date || '',
      description: c.description || '',
    });

    setIsModalOpen(true);
  };

  // Save case
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingCase) {
        await api.updateCase(editingCase.id, formData);
      } else {
        await api.createCase(formData);
      }

      setIsModalOpen(false);
      loadData(searchQuery, selectedStatus);
    } catch (err: any) {
      alert(err.message || 'Error saving case');
    }
  };

  // Delete case
  const handleDelete = async (id: string, num: string) => {
    if (!window.confirm(`Are you sure you want to delete Case ${num}?`)) {
      return;
    }

    try {
      await api.deleteCase(id);
      loadData(searchQuery, selectedStatus);
    } catch (err: any) {
      alert(err.message || 'Failed to delete case');
    }
  };

  // Status styles
  const statusBadges: Record<string, string> = {
    Active: 'bg-[#476B3F]/10 text-[#476B3F] border-[#476B3F]/30',
    'Hearing Pending':
      'bg-[#EAA34B]/15 text-[#9A641F] border-[#EAA34B]/40',
    Decided: 'bg-[#53602F]/10 text-[#53602F] border-[#53602F]/30',
    Closed: 'bg-[#F1E9DA] text-[#6F725E] border-[#D8CCB8]',
  };

  const filters = [
    'All',
    'Active',
    'Hearing Pending',
    'Decided',
    'Closed',
  ];

  return (
    <div className="w-full min-w-0 space-y-5 sm:space-y-6">

      {/* PAGE HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div className="min-w-0">

          <h1 className="flex items-center gap-2 text-xl font-black tracking-tight text-[#34452F] sm:text-2xl">
            <Briefcase className="h-6 w-6 shrink-0 text-[#53602F]" />
            Case Dossier Registry
          </h1>

          <p className="mt-1 text-xs font-medium leading-relaxed text-[#7D806B]">
            Manage litigation dockets, court listings, hearing schedules, and client links.
          </p>

        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#D94F1E] px-4 py-3 text-xs font-bold text-white shadow-md transition-all hover:bg-[#BD4118] sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Create New Case
        </button>

      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-[#E8B8A5] bg-[#FCEAE3] p-3.5 text-xs text-[#C84632]">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span className="min-w-0 break-words">{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            aria-label="Dismiss error"
            className="ml-auto shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* FILTER TABS AND SEARCH */}
      <div className="flex min-w-0 flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4">

        {/* STATUS FILTERS */}
        <div className="w-full min-w-0 md:w-auto">

          <div className="flex w-full items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden rounded-xl border border-[#E9DCC6] bg-[#FFFCF5] p-1.5 md:w-fit">

            {filters.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => handleFilter(s)}
                aria-pressed={selectedStatus === s}
                className={`shrink-0 whitespace-nowrap rounded-lg px-3.5 py-2.5 text-xs font-bold transition-all ${
                  selectedStatus === s
                    ? 'bg-[#476B3F] text-[#FFF8EC] shadow-sm'
                    : 'text-[#7D806B] hover:bg-[#F8EFDF] hover:text-[#34452F]'
                }`}
              >
                {s}
              </button>
            ))}

          </div>

          <p className="mt-1 px-1 text-[10px] text-[#A39B85] md:hidden">
            Swipe horizontally to view all filters →
          </p>

        </div>

        {/* SEARCH */}
        <form
          onSubmit={handleSearch}
          className="flex w-full min-w-0 items-center gap-2 md:max-w-sm"
        >

          <div className="relative min-w-0 flex-1">

            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7D806B]" />

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search case title or number..."
              aria-label="Search cases"
              className="w-full min-w-0 rounded-xl border border-[#E9DCC6] bg-[#FFFCF5] py-3 pl-10 pr-3.5 text-xs text-[#34452F] placeholder:text-[#9B9B83] focus:border-[#53602F] focus:outline-none focus:ring-2 focus:ring-[#EAA34B]/30"
            />

          </div>

          <button
            type="submit"
            className="min-h-11 shrink-0 rounded-xl border border-[#E9DCC6] bg-[#F8EFDF] px-4 py-3 text-xs font-bold text-[#53602F] transition-colors hover:bg-[#EAA34B]/20"
          >
            Search
          </button>

        </form>

      </div>

      {/* CASE COUNT */}
      {!loading && (
        <div className="flex items-center justify-between text-xs text-[#7D806B]">
          <span>
            {cases.length} {cases.length === 1 ? 'case' : 'cases'} found
          </span>

          <span className="font-medium">
            {selectedStatus === 'All' ? 'All statuses' : selectedStatus}
          </span>
        </div>
      )}

      {/* CASES CONTAINER */}
      <div className="overflow-hidden rounded-2xl border border-[#E9DCC6] bg-[#FFFCF5] shadow-sm">

        {loading ? (

          <div className="p-12 text-center text-xs text-[#7D806B]">
            Loading cases...
          </div>

        ) : cases.length > 0 ? (

          <>

            {/* MOBILE CASE CARDS */}
            <div className="space-y-3 p-3 md:hidden">

              {cases.map((c) => (

                <article
                  key={c.id}
                  className="rounded-xl border border-[#E9DCC6] bg-[#FFFCF5] p-3.5 shadow-sm"
                >

                  <div className="flex items-start justify-between gap-3">

                    <div className="min-w-0 flex-1">

                      <p className="break-words text-xs font-bold text-[#34452F]">
                        {c.case_number}
                      </p>

                      <h3 className="mt-1 break-words text-sm font-semibold leading-snug text-[#34452F]">
                        {c.title}
                      </h3>

                    </div>

                    <span
                      className={`shrink-0 rounded-full border px-2 py-1 text-[10px] font-bold ${
                        statusBadges[c.status] ||
                        'border-[#E9DCC6] bg-[#F8EFDF] text-[#6F725E]'
                      }`}
                    >
                      {c.status}
                    </span>

                  </div>

                  <div className="mt-3 space-y-2 border-t border-[#E9DCC6] pt-3">

                    <div className="flex items-start gap-2 text-xs text-[#53602F]">

                      <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-[#7D806B]" />

                      <div className="min-w-0">
                        <p className="break-words font-medium">
                          {c.court_name}
                        </p>

                        <p className="mt-0.5 text-[10px] text-[#7D806B]">
                          {c.case_type || 'Civil'}
                        </p>
                      </div>

                    </div>

                    <div className="flex items-center gap-2 text-xs text-[#53602F]">

                      <User className="h-4 w-4 shrink-0 text-[#7D806B]" />

                      <span className="min-w-0 break-words">
                        {c.client_name || (
                          <span className="text-[#A39B85]">
                            Unassigned client
                          </span>
                        )}
                      </span>

                    </div>

                    <div className="flex items-center gap-2 text-xs text-[#53602F]">

                      <CalendarDays className="h-4 w-4 shrink-0 text-[#7D806B]" />

                      {c.next_hearing_date ? (
                        <span className="font-semibold">
                          Next hearing: {c.next_hearing_date}
                        </span>
                      ) : (
                        <span className="text-[#A39B85]">
                          Hearing not scheduled
                        </span>
                      )}

                    </div>

                  </div>

                  {/* MOBILE ACTIONS */}
                  <div className="mt-3 flex items-center justify-end gap-2 border-t border-[#E9DCC6] pt-3">

                    <button
                      type="button"
                      onClick={() => openEditModal(c)}
                      className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-[#E9DCC6] px-3 text-xs font-semibold text-[#53602F] transition-colors hover:bg-[#F8EFDF]"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(c.id, c.case_number)}
                      className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-[#E8B8A5] px-3 text-xs font-semibold text-[#C84632] transition-colors hover:bg-[#FCEAE3]"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>

                  </div>

                </article>

              ))}

            </div>

            {/* DESKTOP TABLE */}
            <div className="hidden overflow-x-auto md:block">

              <table className="w-full border-collapse text-left">

                <thead>
                  <tr className="border-b border-[#E9DCC6] bg-[#F8EFDF] text-[11px] font-bold uppercase tracking-wider text-[#7D806B]">

                    <th className="whitespace-nowrap px-5 py-4">
                      Case No. & Title
                    </th>

                    <th className="whitespace-nowrap px-5 py-4">
                      Court & Type
                    </th>

                    <th className="whitespace-nowrap px-5 py-4">
                      Client
                    </th>

                    <th className="whitespace-nowrap px-5 py-4">
                      Status
                    </th>

                    <th className="whitespace-nowrap px-5 py-4">
                      Next Hearing
                    </th>

                    <th className="whitespace-nowrap px-5 py-4 text-right">
                      Actions
                    </th>

                  </tr>
                </thead>

                <tbody className="divide-y divide-[#E9DCC6] text-xs">

                  {cases.map((c) => (

                    <tr
                      key={c.id}
                      className="transition-colors hover:bg-[#F8EFDF]"
                    >

                      <td className="max-w-xs px-5 py-4">

                        <div className="break-words font-bold text-[#34452F]">
                          {c.case_number}
                        </div>

                        <div className="mt-1 line-clamp-2 text-[11px] text-[#7D806B]">
                          {c.title}
                        </div>

                      </td>

                      <td className="px-5 py-4">

                        <div className="flex items-start gap-1.5 font-medium text-[#34452F]">

                          <Building2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#7D806B]" />

                          <span className="max-w-[180px] break-words">
                            {c.court_name}
                          </span>

                        </div>

                        <div className="mt-1 text-[10px] text-[#7D806B]">
                          {c.case_type || 'Civil'}
                        </div>

                      </td>

                      <td className="px-5 py-4 font-medium text-[#34452F]">
                        {c.client_name || (
                          <span className="text-[#A39B85]">
                            Unassigned
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4">

                        <span
                          className={`inline-block whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-bold ${
                            statusBadges[c.status] ||
                            'border-[#E9DCC6] bg-[#F8EFDF] text-[#6F725E]'
                          }`}
                        >
                          {c.status}
                        </span>

                      </td>

                      <td className="px-5 py-4">

                        {c.next_hearing_date ? (

                          <div className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md bg-[#EAA34B]/20 px-2 py-1 text-[11px] font-bold text-[#53602F]">
                            <Clock className="h-3 w-3" />
                            {c.next_hearing_date}
                          </div>

                        ) : (

                          <span className="text-[11px] text-[#A39B85]">
                            Not Scheduled
                          </span>

                        )}

                      </td>

                      <td className="px-5 py-4 text-right">

                        <div className="inline-flex items-center gap-2">

                          <button
                            type="button"
                            onClick={() => openEditModal(c)}
                            aria-label={`Edit case ${c.case_number}`}
                            title="Edit Case"
                            className="rounded-lg p-2 text-[#7D806B] transition-colors hover:bg-[#EAA34B]/15 hover:text-[#53602F]"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(c.id, c.case_number)
                            }
                            aria-label={`Delete case ${c.case_number}`}
                            title="Delete Case"
                            className="rounded-lg p-2 text-[#7D806B] transition-colors hover:bg-[#FCEAE3] hover:text-[#C84632]"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>

                        </div>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </>

        ) : (

          /* EMPTY STATE */
          <div className="px-5 py-16 text-center">

            <Briefcase className="mx-auto mb-3 h-10 w-10 text-[#B7B69D]" />

            <h3 className="text-sm font-bold text-[#34452F]">
              No cases found
            </h3>

            <p className="mx-auto mt-2 max-w-xs text-xs leading-relaxed text-[#7D806B]">
              Add your ongoing or new litigation matters to start tracking deadlines.
            </p>

            <button
              type="button"
              onClick={openCreateModal}
              className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#D94F1E] px-4 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-[#BD4118]"
            >
              <Plus className="h-4 w-4" />
              Create Case
            </button>

          </div>

        )}

      </div>

      {/* CREATE / EDIT CASE MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          editingCase
            ? 'Edit Case Docket'
            : 'Create New Litigation Docket'
        }
      >

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Case Number and Court */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-[#34452F]">
                Case Number *
              </label>

              <input
                type="text"
                required
                value={formData.case_number}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    case_number: e.target.value,
                  })
                }
                placeholder="e.g. CS(COMM) 420/2026"
                className="w-full rounded-xl border border-[#E9DCC6] bg-[#FFF8EC] px-3.5 py-3 text-base text-[#34452F] focus:border-[#53602F] focus:outline-none focus:ring-2 focus:ring-[#EAA34B]/30 sm:text-xs"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-[#34452F]">
                Court Name *
              </label>

              <input
                type="text"
                required
                value={formData.court_name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    court_name: e.target.value,
                  })
                }
                placeholder="Supreme Court / High Court"
                className="w-full rounded-xl border border-[#E9DCC6] bg-[#FFF8EC] px-3.5 py-3 text-base text-[#34452F] focus:border-[#53602F] focus:outline-none focus:ring-2 focus:ring-[#EAA34B]/30 sm:text-xs"
              />
            </div>

          </div>

          {/* Case Title */}
          <div>

            <label className="mb-1.5 block text-xs font-semibold text-[#34452F]">
              Case Title / Cause Title *
            </label>

            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  title: e.target.value,
                })
              }
              placeholder="e.g. Reliance Infra Ltd. vs. Union of India"
              className="w-full rounded-xl border border-[#E9DCC6] bg-[#FFF8EC] px-3.5 py-3 text-base text-[#34452F] focus:border-[#53602F] focus:outline-none focus:ring-2 focus:ring-[#EAA34B]/30 sm:text-xs"
            />

          </div>

          {/* Client, Type and Status */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

            <div>

              <label className="mb-1.5 block text-xs font-semibold text-[#34452F]">
                Associated Client
              </label>

              <select
                value={formData.client_id}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    client_id: e.target.value,
                  })
                }
                className="w-full rounded-xl border border-[#E9DCC6] bg-[#FFF8EC] px-3 py-3 text-base text-[#34452F] focus:border-[#53602F] focus:outline-none focus:ring-2 focus:ring-[#EAA34B]/30 sm:text-xs"
              >

                <option value="">
                  -- None / Select Client --
                </option>

                {clients.map((cl) => (
                  <option key={cl.id} value={cl.id}>
                    {cl.full_name}
                  </option>
                ))}

              </select>

            </div>

            <div>

              <label className="mb-1.5 block text-xs font-semibold text-[#34452F]">
                Case Type
              </label>

              <select
                value={formData.case_type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    case_type: e.target.value,
                  })
                }
                className="w-full rounded-xl border border-[#E9DCC6] bg-[#FFF8EC] px-3 py-3 text-base text-[#34452F] focus:border-[#53602F] focus:outline-none focus:ring-2 focus:ring-[#EAA34B]/30 sm:text-xs"
              >
                <option value="Civil">Civil Suit</option>
                <option value="Criminal">Criminal (CrPC/BNSS)</option>
                <option value="Commercial">Commercial Dispute</option>
                <option value="Arbitration">Arbitration (Sec 9/11/34)</option>
                <option value="Constitutional">Writ / Constitutional</option>
                <option value="Insolvency">Insolvency (NCLT / IBC)</option>
              </select>

            </div>

            <div>

              <label className="mb-1.5 block text-xs font-semibold text-[#34452F]">
                Status
              </label>

              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value,
                  })
                }
                className="w-full rounded-xl border border-[#E9DCC6] bg-[#FFF8EC] px-3 py-3 text-base text-[#34452F] focus:border-[#53602F] focus:outline-none focus:ring-2 focus:ring-[#EAA34B]/30 sm:text-xs"
              >
                <option value="Active">Active</option>
                <option value="Hearing Pending">Hearing Pending</option>
                <option value="Decided">Decided</option>
                <option value="Closed">Closed</option>
              </select>

            </div>

          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

            <div>

              <label className="mb-1.5 block text-xs font-semibold text-[#34452F]">
                Filing Date
              </label>

              <input
                type="date"
                value={formData.filing_date}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    filing_date: e.target.value,
                  })
                }
                className="w-full rounded-xl border border-[#E9DCC6] bg-[#FFF8EC] px-3.5 py-3 text-base text-[#34452F] focus:border-[#53602F] focus:outline-none focus:ring-2 focus:ring-[#EAA34B]/30 sm:text-xs"
              />

            </div>

            <div>

              <label className="mb-1.5 block text-xs font-semibold text-[#34452F]">
                Next Hearing Date
              </label>

              <input
                type="date"
                value={formData.next_hearing_date}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    next_hearing_date: e.target.value,
                  })
                }
                className="w-full rounded-xl border border-[#E9DCC6] bg-[#FFF8EC] px-3.5 py-3 text-base text-[#34452F] focus:border-[#53602F] focus:outline-none focus:ring-2 focus:ring-[#EAA34B]/30 sm:text-xs"
              />

            </div>

          </div>

          {/* Description */}
          <div>

            <label className="mb-1.5 block text-xs font-semibold text-[#34452F]">
              Case Summary & Notes
            </label>

            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  description: e.target.value,
                })
              }
              placeholder="Add case summary, important notes and relevant details..."
              className="w-full resize-y rounded-xl border border-[#E9DCC6] bg-[#FFF8EC] px-3.5 py-3 text-base text-[#34452F] focus:border-[#53602F] focus:outline-none focus:ring-2 focus:ring-[#EAA34B]/30 sm:text-xs"
            />

          </div>

          {/* FORM ACTIONS */}
          <div className="flex flex-col-reverse gap-2 border-t border-[#E9DCC6] pt-4 sm:flex-row sm:items-center sm:justify-end sm:gap-3">

            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="min-h-11 rounded-xl px-4 py-2 text-xs font-bold text-[#7D806B] transition-colors hover:bg-[#F8EFDF] hover:text-[#34452F]"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="min-h-11 rounded-xl bg-[#D94F1E] px-5 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-[#BD4118]"
            >
              {editingCase ? 'Update Case' : 'Register Case'}
            </button>

          </div>

        </form>

      </Modal>

    </div>
  );
};

export default Cases;