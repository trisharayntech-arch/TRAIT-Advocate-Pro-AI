import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Briefcase,
  Plus,
  Search,
  Edit2,
  Trash2,
  Calendar,
  Clock,
  Building2,
  AlertCircle
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

  // Form State
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

  const loadData = async (query?: string, status?: string) => {
    try {
      setLoading(true);
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

  useEffect(() => {
    loadData();
    if (searchParams.get('action') === 'new') {
      openCreateModal();
      searchParams.delete('action');
      setSearchParams(searchParams);
    }
  }, []);

  const handleFilter = (status: string) => {
    setSelectedStatus(status);
    loadData(searchQuery, status);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadData(searchQuery, selectedStatus);
  };

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

  const handleDelete = async (id: string, num: string) => {
    if (window.confirm(`Are you sure you want to delete Case ${num}?`)) {
      try {
        await api.deleteCase(id);
        loadData(searchQuery, selectedStatus);
      } catch (err: any) {
        alert(err.message || 'Failed to delete case');
      }
    }
  };

  const statusBadges: Record<string, string> = {
    Active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Hearing Pending': 'bg-amber-50 text-amber-700 border-amber-200',
    Decided: 'bg-blue-50 text-blue-700 border-blue-200',
    Closed: 'bg-slate-100 text-slate-700 border-slate-300',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#172033] tracking-tight flex items-center gap-2.5">
            <Briefcase className="w-6 h-6 text-[#2563EB]" />
            Case Dossier Registry
          </h1>
          <p className="text-xs text-[#8290A5] mt-1 font-medium">
            Manage litigation dockets, court listings, hearing schedules, and client links.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Create New Case
        </button>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Tabs & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1 bg-white border border-[#E2E8F0] rounded-xl overflow-x-auto">
          {['All', 'Active', 'Hearing Pending', 'Decided', 'Closed'].map((s) => (
            <button
              key={s}
              onClick={() => handleFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedStatus === s
                  ? 'bg-[#101A2C] text-white shadow-xs'
                  : 'text-[#8290A5] hover:text-[#172033] hover:bg-slate-50'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearch} className="flex items-center gap-2 max-w-sm w-full">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#8290A5] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search case title or number..."
              className="w-full bg-white border border-[#E2E8F0] rounded-xl pl-10 pr-3.5 py-2 text-xs text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
            />
          </div>
          <button
            type="submit"
            className="px-3.5 py-2 bg-white border border-[#E2E8F0] hover:bg-slate-50 text-xs font-bold rounded-xl"
          >
            Search
          </button>
        </form>
      </div>

      {/* Cases Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-[#8290A5]">Loading cases...</div>
        ) : cases.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200 text-[11px] font-bold text-[#8290A5] uppercase tracking-wider">
                  <th className="py-3.5 px-6">Case No. & Title</th>
                  <th className="py-3.5 px-6">Court & Type</th>
                  <th className="py-3.5 px-6">Client</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Next Hearing</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {cases.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-[#172033]">{c.case_number}</div>
                      <div className="text-[11px] text-[#8290A5] line-clamp-1 max-w-xs">{c.title}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5 text-[#172033] font-medium">
                        <Building2 className="w-3.5 h-3.5 text-[#8290A5]" />
                        <span>{c.court_name}</span>
                      </div>
                      <div className="text-[10px] text-[#8290A5] mt-0.5">{c.case_type || 'Civil'}</div>
                    </td>
                    <td className="py-4 px-6 text-[#172033] font-medium">
                      {c.client_name || <span className="text-slate-400">Unassigned</span>}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                          statusBadges[c.status] || 'bg-slate-50 text-slate-600 border-slate-200'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {c.next_hearing_date ? (
                        <div className="inline-flex items-center gap-1.5 text-[#2563EB] font-bold bg-blue-50 px-2 py-0.5 rounded-md text-[11px]">
                          <Clock className="w-3 h-3" />
                          <span>{c.next_hearing_date}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Not Scheduled</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(c)}
                          className="p-1.5 text-slate-500 hover:text-[#2563EB] hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit Case"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id, c.case_number)}
                          className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Case"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16">
            <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-[#172033]">No cases found</h3>
            <p className="text-xs text-[#8290A5] mt-1 max-w-xs mx-auto">
              Add your ongoing or new litigation matters to start tracking deadlines.
            </p>
            <button
              onClick={openCreateModal}
              className="mt-4 px-4 py-2 bg-[#2563EB] text-white text-xs font-bold rounded-xl shadow-xs"
            >
              + Create Case
            </button>
          </div>
        )}
      </div>

      {/* Case Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCase ? 'Edit Case Docket' : 'Create New Litigation Docket'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#172033] mb-1.5">Case Number *</label>
              <input
                type="text"
                required
                value={formData.case_number}
                onChange={(e) => setFormData({ ...formData, case_number: e.target.value })}
                placeholder="e.g. CS(COMM) 420/2026"
                className="w-full bg-[#F5F7FB] border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#172033] mb-1.5">Court Name *</label>
              <input
                type="text"
                required
                value={formData.court_name}
                onChange={(e) => setFormData({ ...formData, court_name: e.target.value })}
                placeholder="e.g. Supreme Court of India / High Court of Delhi"
                className="w-full bg-[#F5F7FB] border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#172033] mb-1.5">Case Title / Cause Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Reliance Infra Ltd. vs. Union of India & Anr."
              className="w-full bg-[#F5F7FB] border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#172033] mb-1.5">Associated Client</label>
              <select
                value={formData.client_id}
                onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                className="w-full bg-[#F5F7FB] border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
              >
                <option value="">-- None / Select Client --</option>
                {clients.map((cl) => (
                  <option key={cl.id} value={cl.id}>
                    {cl.full_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#172033] mb-1.5">Case Type</label>
              <select
                value={formData.case_type}
                onChange={(e) => setFormData({ ...formData, case_type: e.target.value })}
                className="w-full bg-[#F5F7FB] border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
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
              <label className="block text-xs font-semibold text-[#172033] mb-1.5">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-[#F5F7FB] border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
              >
                <option value="Active">Active</option>
                <option value="Hearing Pending">Hearing Pending</option>
                <option value="Decided">Decided</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#172033] mb-1.5">Filing Date</label>
              <input
                type="date"
                value={formData.filing_date}
                onChange={(e) => setFormData({ ...formData, filing_date: e.target.value })}
                className="w-full bg-[#F5F7FB] border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#172033] mb-1.5">Next Hearing Date</label>
              <input
                type="date"
                value={formData.next_hearing_date}
                onChange={(e) => setFormData({ ...formData, next_hearing_date: e.target.value })}
                className="w-full bg-[#F5F7FB] border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#172033] mb-1.5">Case Summary & Notes</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Suit for perpetual injunction and damages; ad-interim ex-parte relief granted on previous date..."
              className="w-full bg-[#F5F7FB] border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-[#8290A5] hover:text-[#172033] hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-[#2563EB] hover:bg-blue-700 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              {editingCase ? 'Update Case' : 'Register Case'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
