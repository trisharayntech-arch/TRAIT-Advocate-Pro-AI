import React, { useEffect, useState } from 'react';
import {
  PenTool,
  Download,
  Trash2,
  Save,
  Sparkles,
  FileText,
  AlertTriangle,
  FileDown,
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
    } catch (err) {
      console.error('Failed to load drafting data:', err);
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

      setDrafts((prev) => [newDraft, ...prev]);
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
      setDrafts((prev) =>
        prev.map((d) => (d.id === updated.id ? updated : d))
      );

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

  const inputClass =
    'w-full bg-[#FFF8EC] border border-[#E9DCC6] rounded-xl px-3.5 py-2.5 text-xs text-[#34452F] placeholder:text-[#A29B87] focus:outline-none focus:ring-2 focus:ring-[#EAA34B]/30 focus:border-[#EAA34B] transition-all';

  const labelClass =
    'block text-xs font-semibold text-[#34452F] mb-1.5';

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#34452F] tracking-tight flex items-center gap-2.5">
            <PenTool className="w-6 h-6 text-[#EAA34B]" />
            Legal Drafting Studio
          </h1>

          <p className="text-xs text-[#7D806B] mt-1 font-medium">
            AI-assisted generation of legal notices, affidavits, agreements, and pleadings with DOCX export.
          </p>
        </div>

        <button
          onClick={() => setIsGenerateModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#476B3F] hover:bg-[#34452F] text-white text-xs font-bold rounded-xl shadow-md shadow-[#476B3F]/20 transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-[#F4C36B]" />
          Generate New Draft
        </button>
      </div>

      {/* Advocate Review Warning */}
      <div className="p-4 rounded-xl bg-[#F8EFDF] border border-[#EAA34B]/40 text-[#79551F] text-xs flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 shrink-0 text-[#D18A32] mt-0.5" />

        <span className="leading-relaxed">
          <strong>Mandatory Advocate Review Notice:</strong>{' '}
          AI generated drafts provide structural and procedural baselines.
          Every paragraph, prayer, and fact must be verified by a licensed
          Advocate prior to service, notarization, or court presentation.
        </span>
      </div>

      {/* Draft History + Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px]">

        {/* Draft History */}
        <div className="lg:col-span-4 bg-[#FFFCF5] rounded-2xl border border-[#E9DCC6] shadow-sm flex flex-col overflow-hidden">

          <div className="p-4 border-b border-[#E9DCC6] flex items-center justify-between bg-[#F8EFDF]">
            <span className="text-xs font-bold text-[#34452F] uppercase tracking-wider">
              Saved Drafts ({drafts.length})
            </span>

            <FileText className="w-4 h-4 text-[#D18A32]" />
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">

            {loading ? (
              <div className="p-8 text-center text-xs text-[#7D806B]">
                Loading drafts...
              </div>
            ) : drafts.length > 0 ? (
              drafts.map((d) => (
                <div
                  key={d.id}
                  onClick={() => selectDraftItem(d)}
                  className={`p-3 rounded-xl cursor-pointer transition-all border ${
                    selectedDraft?.id === d.id
                      ? 'bg-[#476B3F]/10 border-[#476B3F] shadow-sm'
                      : 'border-transparent hover:bg-[#F8EFDF]'
                  }`}
                >
                  <div className="flex items-center justify-between">

                    <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-[#34452F] text-[#FFF8EC]">
                      {d.draft_type}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteDraft(d.id);
                      }}
                      className="text-[#A29B87] hover:text-[#D94F1E] p-1 rounded-md transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                  </div>

                  <h4 className="text-xs font-bold text-[#34452F] mt-2 truncate">
                    {d.title}
                  </h4>

                  <p className="text-[10px] text-[#7D806B] mt-1">
                    Updated {new Date(d.updated_at).toLocaleDateString()}
                  </p>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <FileText className="w-9 h-9 text-[#D9C9AD] mx-auto mb-3" />

                <p className="text-xs text-[#7D806B] leading-relaxed">
                  No drafts yet. Click "Generate New Draft" to create legal
                  notices, affidavits, or agreements.
                </p>
              </div>
            )}

          </div>
        </div>

        {/* Draft Editor */}
        <div className="lg:col-span-8 bg-[#FFFCF5] rounded-2xl border border-[#E9DCC6] shadow-sm flex flex-col overflow-hidden">

          {selectedDraft ? (
            <>
              {/* Editor Header */}
              <div className="p-4 border-b border-[#E9DCC6] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F8EFDF]/60">

                <input
                  type="text"
                  value={editorTitle}
                  onChange={(e) => setEditorTitle(e.target.value)}
                  className="text-sm font-bold text-[#34452F] bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-[#EAA34B] rounded px-1.5 py-1 flex-1"
                />

                <div className="flex items-center gap-2">

                  <a
                    href={api.getDraftDocxUrl(selectedDraft.id)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-[#476B3F] bg-[#476B3F]/10 hover:bg-[#476B3F]/20 rounded-xl transition-colors cursor-pointer"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    Export DOCX
                  </a>

                  <button
                    onClick={handleSaveDraft}
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-[#476B3F] hover:bg-[#34452F] rounded-xl shadow-sm transition-colors cursor-pointer disabled:opacity-50"
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
                  className="w-full h-[500px] p-4 text-xs font-mono leading-relaxed bg-[#FFF8EC] border border-[#E9DCC6] rounded-xl text-[#34452F] focus:outline-none focus:ring-2 focus:ring-[#EAA34B]/30 focus:border-[#EAA34B] resize-y"
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-[#7D806B]">

              <div className="w-16 h-16 rounded-2xl bg-[#EAA34B]/15 flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-[#D18A32]" />
              </div>

              <h3 className="text-sm font-bold text-[#34452F]">
                Select or Generate a Legal Draft
              </h3>

              <p className="text-xs max-w-sm mt-1 leading-relaxed">
                Choose a saved draft on the left or generate a new legal
                notice, affidavit, or petition.
              </p>

              <button
                onClick={() => setIsGenerateModalOpen(true)}
                className="mt-5 px-4 py-2.5 bg-[#476B3F] hover:bg-[#34452F] text-white text-xs font-bold rounded-xl transition-colors"
              >
                <span className="inline-flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  Generate Your First Draft
                </span>
              </button>
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
              <label className={labelClass}>Document Type *</label>

              <select
                value={genForm.draft_type}
                onChange={(e) =>
                  setGenForm({ ...genForm, draft_type: e.target.value })
                }
                className={inputClass}
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
              <label className={labelClass}>Draft Title *</label>

              <input
                type="text"
                required
                value={genForm.title}
                onChange={(e) =>
                  setGenForm({ ...genForm, title: e.target.value })
                }
                placeholder="Enter a title for your legal draft"
                className={inputClass}
              />
            </div>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div>
              <label className={labelClass}>Link to Case (Optional)</label>

              <select
                value={genForm.case_id}
                onChange={(e) =>
                  setGenForm({ ...genForm, case_id: e.target.value })
                }
                className={inputClass}
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
              <label className={labelClass}>Link to Client (Optional)</label>

              <select
                value={genForm.client_id}
                onChange={(e) =>
                  setGenForm({ ...genForm, client_id: e.target.value })
                }
                className={inputClass}
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
            <label className={labelClass}>Parties Involved</label>

            <input
              type="text"
              value={genForm.parties}
              onChange={(e) =>
                setGenForm({ ...genForm, parties: e.target.value })
              }
              placeholder="e.g. Complainant and Accused / Applicant and Respondent"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>
              Key Facts & Transactional History *
            </label>

            <textarea
              rows={4}
              required
              value={genForm.facts}
              onChange={(e) =>
                setGenForm({ ...genForm, facts: e.target.value })
              }
              placeholder="Enter the relevant facts, dates, events, transaction details and background..."
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>
              Specific Prayers, Demands, or Clauses
            </label>

            <textarea
              rows={3}
              value={genForm.clauses_or_prayers}
              onChange={(e) =>
                setGenForm({
                  ...genForm,
                  clauses_or_prayers: e.target.value,
                })
              }
              placeholder="Enter specific demands, reliefs, prayers or clauses..."
              className={inputClass}
            />
          </div>

          <div className="pt-3 border-t border-[#E9DCC6] flex items-center justify-end gap-3">

            <button
              type="button"
              onClick={() => setIsGenerateModalOpen(false)}
              className="px-4 py-2.5 text-xs font-bold text-[#7D806B] hover:text-[#34452F] hover:bg-[#F8EFDF] rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={generating}
              className="px-5 py-2.5 text-xs font-bold text-white bg-[#476B3F] hover:bg-[#34452F] rounded-xl shadow-sm transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#F4C36B]" />
              {generating ? 'Drafting Document...' : 'Generate Legal Draft'}
            </button>

          </div>
        </form>
      </Modal>

    </div>
  );
};