import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Users,
  Plus,
  Search,
  Edit2,
  Trash2,
  Mail,
  Phone,
  MapPin,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';
import { Client } from '../types';
import { Modal } from '../components/Modal';

export const Clients: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
  });

  const loadClients = async (query?: string) => {
    try {
      setLoading(true);
      const data = await api.getClients(query);
      setClients(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();

    if (searchParams.get('action') === 'new') {
      openCreateModal();
      searchParams.delete('action');
      setSearchParams(searchParams);
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadClients(searchQuery);
  };

  const openCreateModal = () => {
    setEditingClient(null);
    setFormData({
      full_name: '',
      email: '',
      phone: '',
      address: '',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (client: Client) => {
    setEditingClient(client);
    setFormData({
      full_name: client.full_name,
      email: client.email || '',
      phone: client.phone || '',
      address: client.address || '',
      notes: client.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingClient) {
        await api.updateClient(editingClient.id, formData);
      } else {
        await api.createClient(formData);
      }

      setIsModalOpen(false);
      loadClients(searchQuery);
    } catch (err: any) {
      alert(err.message || 'Error saving client');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete client "${name}"?`)) {
      try {
        await api.deleteClient(id);
        loadClients(searchQuery);
      } catch (err: any) {
        alert(err.message || 'Failed to delete client');
      }
    }
  };

  return (
    <div className="space-y-6">

      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

        <div>
          <h1 className="text-2xl font-black text-[#34452F] tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-[#53602F]" />
            Client Directory
          </h1>

          <p className="text-xs text-[#7D806B] mt-1 font-medium">
            Manage litigant contact profiles, addresses, and case history.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#D94F1E] hover:bg-[#BD4118] text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add New Client
        </button>

      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="p-3.5 rounded-xl bg-[#FCEAE3] border border-[#E8B8A5] text-xs text-[#C84632] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-[#C84632] shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* SEARCH BAR */}
      <form onSubmit={handleSearch} className="flex items-center gap-3">

        <div className="relative flex-1 max-w-md">

          <Search className="w-4 h-4 text-[#7D806B] absolute left-3.5 top-1/2 -translate-y-1/2" />

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by client name, email, or phone..."
            className="w-full bg-[#FFFCF5] border border-[#E9DCC6] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#34452F] placeholder-[#A39B85] focus:outline-none focus:ring-2 focus:ring-[#EAA34B]/30 focus:border-[#53602F]"
          />

        </div>

        <button
          type="submit"
          className="px-4 py-2.5 bg-[#F8EFDF] border border-[#E9DCC6] hover:bg-[#EAA34B]/20 text-[#53602F] text-xs font-bold rounded-xl transition-colors cursor-pointer"
        >
          Search
        </button>

      </form>

      {/* CLIENT TABLE */}
      <div className="bg-[#FFFCF5] rounded-2xl border border-[#E9DCC6] shadow-sm overflow-hidden">

        {loading ? (

          <div className="p-12 text-center text-xs text-[#7D806B]">
            Loading client directory...
          </div>

        ) : clients.length > 0 ? (

          <div className="overflow-x-auto">

            <table className="w-full text-left border-collapse">

              <thead>
                <tr className="bg-[#F8EFDF] border-b border-[#E9DCC6] text-[11px] font-bold text-[#7D806B] uppercase tracking-wider">

                  <th className="py-3.5 px-6">Client Name</th>
                  <th className="py-3.5 px-6">Contact Info</th>
                  <th className="py-3.5 px-6">Address</th>
                  <th className="py-3.5 px-6">Notes</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>

                </tr>
              </thead>

              <tbody className="divide-y divide-[#E9DCC6] text-xs">

                {clients.map((c) => (

                  <tr
                    key={c.id}
                    className="hover:bg-[#F8EFDF] transition-colors"
                  >

                    {/* CLIENT NAME */}
                    <td className="py-4 px-6 font-bold text-[#34452F]">

                      <div className="flex items-center gap-3">

                        <div className="w-9 h-9 rounded-full bg-[#476B3F]/15 text-[#476B3F] font-bold flex items-center justify-center shrink-0 border border-[#476B3F]/20">
                          {c.full_name.charAt(0).toUpperCase()}
                        </div>

                        <div>
                          <div>{c.full_name}</div>

                          <div className="text-[10px] text-[#7D806B] font-normal mt-0.5">
                            Added {new Date(c.created_at).toLocaleDateString()}
                          </div>
                        </div>

                      </div>

                    </td>

                    {/* CONTACT INFORMATION */}
                    <td className="py-4 px-6">

                      <div className="space-y-1">

                        {c.phone && (
                          <div className="flex items-center gap-1.5 text-[#34452F]">
                            <Phone className="w-3 h-3 text-[#53602F]" />
                            <span>{c.phone}</span>
                          </div>
                        )}

                        {c.email && (
                          <div className="flex items-center gap-1.5 text-[#7D806B] text-[11px]">
                            <Mail className="w-3 h-3 text-[#D94F1E]" />
                            <span>{c.email}</span>
                          </div>
                        )}

                        {!c.phone && !c.email && (
                          <span className="text-[#A39B85]">—</span>
                        )}

                      </div>

                    </td>

                    {/* ADDRESS */}
                    <td className="py-4 px-6 max-w-xs truncate text-[#7D806B]">

                      {c.address ? (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3 h-3 text-[#53602F] shrink-0" />
                          <span className="truncate">{c.address}</span>
                        </div>
                      ) : (
                        '—'
                      )}

                    </td>

                    {/* NOTES */}
                    <td className="py-4 px-6 max-w-xs truncate text-[#7D806B]">
                      {c.notes || '—'}
                    </td>

                    {/* ACTIONS */}
                    <td className="py-4 px-6 text-right">

                      <div className="inline-flex items-center gap-2">

                        <button
                          onClick={() => openEditModal(c)}
                          className="p-1.5 text-[#7D806B] hover:text-[#53602F] hover:bg-[#EAA34B]/15 rounded-lg transition-colors cursor-pointer"
                          title="Edit Client"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDelete(c.id, c.full_name)}
                          className="p-1.5 text-[#7D806B] hover:text-[#C84632] hover:bg-[#FCEAE3] rounded-lg transition-colors cursor-pointer"
                          title="Delete Client"
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

          /* EMPTY STATE */
          <div className="text-center py-16">

            <Users className="w-10 h-10 text-[#B7B69D] mx-auto mb-2" />

            <h3 className="text-sm font-bold text-[#34452F]">
              No clients found
            </h3>

            <p className="text-xs text-[#7D806B] mt-1 max-w-xs mx-auto">
              {searchQuery
                ? 'Try another search term.'
                : 'Get started by creating your first client record.'}
            </p>

            <button
              onClick={openCreateModal}
              className="mt-4 px-4 py-2 bg-[#D94F1E] hover:bg-[#BD4118] text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
            >
              + Add Client
            </button>

          </div>

        )}

      </div>

      {/* CLIENT MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingClient ? 'Edit Client Record' : 'Register New Client'}
      >

        <form onSubmit={handleSubmit} className="space-y-4">

          <div>

            <label className="block text-xs font-semibold text-[#34452F] mb-1.5">
              Full Name *
            </label>

            <input
              type="text"
              required
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              placeholder="e.g. Anand Mahindra / Tata Consultancy Services Ltd."
              className="w-full bg-[#FFF8EC] border border-[#E9DCC6] rounded-xl px-3.5 py-2 text-xs text-[#34452F] focus:outline-none focus:ring-2 focus:ring-[#EAA34B]/30 focus:border-[#53602F]"
            />

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div>

              <label className="block text-xs font-semibold text-[#34452F] mb-1.5">
                Email Address
              </label>

              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="client@domain.com"
                className="w-full bg-[#FFF8EC] border border-[#E9DCC6] rounded-xl px-3.5 py-2 text-xs text-[#34452F] focus:outline-none focus:ring-2 focus:ring-[#EAA34B]/30 focus:border-[#53602F]"
              />

            </div>

            <div>

              <label className="block text-xs font-semibold text-[#34452F] mb-1.5">
                Phone Number
              </label>

              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98200 12345"
                className="w-full bg-[#FFF8EC] border border-[#E9DCC6] rounded-xl px-3.5 py-2 text-xs text-[#34452F] focus:outline-none focus:ring-2 focus:ring-[#EAA34B]/30 focus:border-[#53602F]"
              />

            </div>

          </div>

          <div>

            <label className="block text-xs font-semibold text-[#34452F] mb-1.5">
              Address / Registered Office
            </label>

            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Plot 42, Bandra Kurla Complex, Mumbai, Maharashtra"
              className="w-full bg-[#FFF8EC] border border-[#E9DCC6] rounded-xl px-3.5 py-2 text-xs text-[#34452F] focus:outline-none focus:ring-2 focus:ring-[#EAA34B]/30 focus:border-[#53602F]"
            />

          </div>

          <div>

            <label className="block text-xs font-semibold text-[#34452F] mb-1.5">
              Confidential Notes
            </label>

            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Corporate advisory client; Retainer fee structure; Key liaison contact..."
              className="w-full bg-[#FFF8EC] border border-[#E9DCC6] rounded-xl px-3.5 py-2 text-xs text-[#34452F] focus:outline-none focus:ring-2 focus:ring-[#EAA34B]/30 focus:border-[#53602F]"
            />

          </div>

          {/* MODAL ACTIONS */}
          <div className="pt-3 border-t border-[#E9DCC6] flex items-center justify-end gap-3">

            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-[#7D806B] hover:text-[#34452F] hover:bg-[#F8EFDF] rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-[#D94F1E] hover:bg-[#BD4118] rounded-xl shadow-sm transition-colors cursor-pointer"
            >
              {editingClient ? 'Update Client' : 'Create Client'}
            </button>

          </div>

        </form>

      </Modal>

    </div>
  );
};