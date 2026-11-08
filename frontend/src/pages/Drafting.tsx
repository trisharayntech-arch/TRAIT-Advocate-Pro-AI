import React, { useEffect, useState } from 'react';
import {
  PenTool,
  Plus,
  Download,
  Trash2,
  Save,
  Sparkles,
  FileText,
  AlertTriangle,
  CheckCircle,
  FileDown
} from 'lucide-react';
import { api } from '../services/api';
import { DraftItem, Case, Client } from '../types';
import { Modal } from '../components/Modal';

export const Drafting: React.FC = () => {
  const [drafts, setDrafts] = useState<DraftItem[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedDraft, setSelectedDraft] = useState<DraftItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);

  // Generator form
  const [genForm, setGenForm] = useState({
    title: '',
    draft_type: 'Legal Notice',
    instructions: '',
    case_id: '',
    client_id: '',
    parties: '',
    facts: '',
    clauses_or_prayers: '',
  });

  // Active Draft Editor Content
  const [editorTitle, setEditorTitle] = useState('');
  const [editorContent, setEditorContent] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [draftsData, casesData, clientsData] = await Promise.all([
        api.getDrafts(),
        api.getCases(),
        api.getClients(),
      ]);
      setDrafts(draftsData);
      setCases(casesData);
      setClients(clientsData);
      if (draftsData.length > 0 && !selectedDraft) {
        selectDraftItem(draftsData[0]);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const selectDraftItem = (draft: DraftItem) => {
    setSelectedDraft(draft);
    setEditorTitle(draft.title);
    setEditorContent(draft.content);
  };

  const handleGenerateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    try {
      const newDraft = await api.generateDraft(genForm);
      setDrafts([newDraft, ...drafts]);
      selectDraftItem(newDraft);
      setIsGenerateModalOpen(false);
      setGenForm({
        title: '',
        draft_type: 'Legal Notice',
        instructions: '',
        case_id: '',
        client_id: '',
        parties: '',
        facts: '',
        clauses_or_prayers: '',
      });
    } catch (err: any) {
      alert(err.message || 'Failed to generate draft');
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!selectedDraft) return;
    setSaving(true);
    try {
      const updated = await api.updateDraft(selectedDraft.id, {
        title: editorTitle,
        content: editorContent,
      });
      setSelectedDraft(updated);
      setDrafts(drafts.map((d) => (d.id === updated.id ? updated : d)));
      alert('Draft saved successfully!');
    } catch (err: any) {
      alert(err.message || 'Error saving draft');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteDraft = async (id: string) => {
    if (window.confirm('Delete this draft permanently?')) {
      try {
        await api.deleteDraft(id);
        const nextDrafts = drafts.filter((d) => d.id !== id);
        setDrafts(nextDrafts);
        if (selectedDraft?.id === id) {
          if (nextDrafts.length > 0) {
            selectDraftItem(nextDrafts[0]);
          } else {
            setSelectedDraft(null);
            setEditorTitle('');
            setEditorContent('');
          }
        }
      } catch (err: any) {
        alert(err.message || 'Failed to delete draft');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#172033] tracking-tight flex items-center gap-2.5">
            <PenTool className="w-6 h-6 text-[#2563EB]" />
            Legal Drafting Studio
          </h1>
          <p className="text-xs text-[#8290A5] mt-1 font-medium">
            AI-assisted generation of legal notices, affidavits, agreements, and pleadings with DOCX export.
          </p>
        </div>

        <button
          onClick={() => setIsGenerateModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          Generate New Draft
        </button>
      </div>

      {/* Legal Professional Warning Banner */}
      <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-3">
        <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
        <span>
          <strong>Mandatory Advocate Review Notice:</strong> AI generated drafts provide structural and procedural baselines. Every paragraph, prayer, and fact must be verified by a licensed Advocate prior to service, notarization, or court presentation.
        </span>
      </div>

      {/* Two Column Layout: Drafts List & Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px]">
        {/* Left: Drafts History List */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <span className="text-xs font-bold text-[#172033] uppercase tracking-wider">
              Saved Drafts ({drafts.length})
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {loading ? (
              <div className="p-8 text-center text-xs text-[#8290A5]">Loading drafts...</div>
            ) : drafts.length > 0 ? (
              drafts.map((d) => (
                <div
                  key={d.id}
                  onClick={() => selectDraftItem(d)}
                  className={`p-3 rounded-xl cursor-pointer transition-all border ${
                    selectedDraft?.id === d.id
                      ? 'bg-blue-50/60 border-[#2563EB] shadow-xs'
                      : 'border-transparent hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#101A2C] text-white">
                      {d.draft_type}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteDraft(d.id);
                      }}
                      className="text-slate-400 hover:text-red-600 p-1 rounded-md"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <h4 className="text-xs font-bold text-[#172033] mt-1.5 truncate">{d.title}</h4>
                  <p className="text-[10px] text-[#8290A5] mt-1">
                    Updated {new Date(d.updated_at).toLocaleDateString()}
                  </p>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-[#8290A5]">
                No drafts yet. Click "Generate New Draft" to create legal notices, affidavits, or agreements.
              </div>
            )}
          </div>
        </div>

        {/* Right: Active Draft Editor */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
          {selectedDraft ? (
            <>
              {/* Editor Header */}
              <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/40">
                <input
                  type="text"
                  value={editorTitle}
                  onChange={(e) => setEditorTitle(e.target.value)}
                  className="text-sm font-bold text-[#172033] bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-[#2563EB] rounded px-1.5 py-0.5 flex-1"
                />
                <div className="flex items-center gap-2">
                  <a
                    href={api.getDraftDocxUrl(selectedDraft.id)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#2563EB] bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors cursor-pointer"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    Export DOCX
                  </a>
                  <button
                    onClick={handleSaveDraft}
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-[#2563EB] hover:bg-blue-700 rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>

              {/* Editor Body */}
              <div className="flex-1 p-4">
                <textarea
                  value={editorContent}
                  onChange={(e) => setEditorContent(e.target.value)}
                  className="w-full h-[500px] p-4 text-xs font-mono leading-relaxed bg-[#F5F7FB] border border-[#E2E8F0] rounded-xl text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] resize-y"
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-[#8290A5]">
              <FileText className="w-12 h-12 text-slate-300 mb-3" />
              <h3 className="text-sm font-bold text-[#172033]">Select or Generate a Legal Draft</h3>
              <p className="text-xs max-w-sm mt-1">
                Choose a saved draft on the left or generate a new legal notice, affidavit, or petition.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Generate Draft Modal */}
      <Modal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        title="AI Legal Document Generator"
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleGenerateSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#172033] mb-1.5">Document Type *</label>
              <select
                value={genForm.draft_type}
                onChange={(e) => setGenForm({ ...genForm, draft_type: e.target.value })}
                className="w-full bg-[#F5F7FB] border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
              >
                <option value="Legal Notice">Legal Notice (Sec 138 / Dues / Eviction)</option>
                <option value="Affidavit">Affidavit (Evidence / Verification)</option>
                <option value="Agreement">Agreement / NDA / Commercial Contract</option>
                <option value="Application">Application (Bail / Exemption / Condonation)</option>
                <option value="Client Letter">Client Legal Opinion Letter</option>
                <option value="Custom">Custom Pleading</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#172033] mb-1.5">Draft Title *</label>
              <input
                type="text"
                required
                value={genForm.title}
                onChange={(e) => setGenForm({ ...genForm, title: e.target.value })}
                placeholder="e.g. Legal Notice under Section 138 NI Act for Cheque Dishonour"
                className="w-full bg-[#F5F7FB] border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#172033] mb-1.5">Link to Case (Optional)</label>
              <select
                value={genForm.case_id}
                onChange={(e) => setGenForm({ ...genForm, case_id: e.target.value })}
                className="w-full bg-[#F5F7FB] border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
              >
                <option value="">-- No Case Link --</option>
                {cases.map((cs) => (
                  <option key={cs.id} value={cs.id}>
                    {cs.case_number} - {cs.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#172033] mb-1.5">Link to Client (Optional)</label>
              <select
                value={genForm.client_id}
                onChange={(e) => setGenForm({ ...genForm, client_id: e.target.value })}
                className="w-full bg-[#F5F7FB] border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
              >
                <option value="">-- No Client Link --</option>
                {clients.map((cl) => (
                  <option key={cl.id} value={cl.id}>
                    {cl.full_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#172033] mb-1.5">Parties Involved</label>
            <input
              type="text"
              value={genForm.parties}
              onChange={(e) => setGenForm({ ...genForm, parties: e.target.value })}
              placeholder="e.g. Complainant: M/s Apex Tech; Accused/Addressee: Global Traders Pvt Ltd & Directors"
              className="w-full bg-[#F5F7FB] border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#172033] mb-1.5">Key Facts & Transactional History *</label>
            <textarea
              rows={3}
              required
              value={genForm.facts}
              onChange={(e) => setGenForm({ ...genForm, facts: e.target.value })}
              placeholder="Cheque No. 491029 dated 15 Jan 2026 for Rs. 25,00,000/- drawn on HDFC Bank was dishonoured with return memo 'Insufficient Funds' on 20 Jan 2026..."
              className="w-full bg-[#F5F7FB] border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#172033] mb-1.5">Specific Prayers, Demands, or Clauses</label>
            <textarea
              rows={2}
              value={genForm.clauses_or_prayers}
              onChange={(e) => setGenForm({ ...genForm, clauses_or_prayers: e.target.value })}
              placeholder="Demand for payment of Rs. 25 Lakhs within 15 days plus 18% p.a. interest; notice cost of Rs. 15,000/-..."
              className="w-full bg-[#F5F7FB] border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsGenerateModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-[#8290A5] hover:text-[#172033] hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={generating}
              className="px-5 py-2 text-xs font-bold text-white bg-[#2563EB] hover:bg-blue-700 rounded-xl shadow-xs transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {generating ? 'Drafting Document...' : 'Generate Legal Draft'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
