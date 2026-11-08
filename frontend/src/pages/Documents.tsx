import React, { useEffect, useState } from 'react';
import {
  FileText,
  UploadCloud,
  Download,
  Trash2,
  Eye,
  AlertCircle,
  Database,
} from 'lucide-react';
import { api } from '../services/api';
import { DocumentItem, Case, Client } from '../types';
import { Modal } from '../components/Modal';

export const Documents: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedCaseId, setSelectedCaseId] = useState('');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<DocumentItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const [docsData, casesData, clientsData] = await Promise.all([
        api.getDocuments(),
        api.getCases(),
        api.getClients(),
      ]);

      setDocuments(docsData);
      setCases(casesData);
      setClients(clientsData);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const ext = file.name.split('.').pop()?.toLowerCase();

      if (!['pdf', 'docx', 'txt'].includes(ext || '')) {
        alert('Supported document formats: PDF, DOCX, and TXT.');
        e.target.value = '';
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    try {
      setUploading(true);

      await api.uploadDocument(
        selectedFile,
        selectedCaseId || undefined,
        selectedClientId || undefined
      );

      setIsUploadModalOpen(false);
      setSelectedFile(null);
      setSelectedCaseId('');
      setSelectedClientId('');
      await loadDocuments();
    } catch (err: any) {
      alert(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Delete document "${name}" and its index?`)) {
      try {
        await api.deleteDocument(id);
        await loadDocuments();
      } catch (err: any) {
        alert(err.message || 'Failed to delete document');
      }
    }
  };

  const viewExtractedText = async (id: string) => {
    try {
      const detail = await api.getDocumentDetail(id);
      setViewingDoc(detail);
    } catch (err: any) {
      alert(err.message || 'Failed to fetch document text');
    }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#34452F] tracking-tight flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-[#EAA34B]" />
            Document Vault & RAG Index
          </h1>

          <p className="text-xs text-[#7D806B] mt-1 font-medium">
            Upload petitions, affidavits, contracts, and court orders for neural text extraction and RAG search.
          </p>
        </div>

        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#476B3F] hover:bg-[#34452F] text-white text-xs font-bold rounded-xl shadow-md shadow-[#476B3F]/20 transition-all cursor-pointer"
        >
          <UploadCloud className="w-4 h-4" />
          Upload & Index Document
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3.5 rounded-xl bg-[#FCEAE3] border border-[#E9B9A7] text-xs text-[#BD4118] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Document Table */}
      <div className="bg-[#FFFCF5] rounded-2xl border border-[#E9DCC6] shadow-sm overflow-hidden">

        {loading ? (
          <div className="p-12 text-center text-xs text-[#7D806B]">
            Loading document repository...
          </div>
        ) : documents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">

              <thead>
                <tr className="bg-[#F8EFDF] border-b border-[#E9DCC6] text-[11px] font-bold text-[#53602F] uppercase tracking-wider">
                  <th className="py-3.5 px-6">File Name</th>
                  <th className="py-3.5 px-6">Size</th>
                  <th className="py-3.5 px-6">RAG Chunks</th>
                  <th className="py-3.5 px-6">Uploaded Date</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#E9DCC6] text-xs">
                {documents.map((d) => (
                  <tr
                    key={d.id}
                    className="hover:bg-[#F8EFDF]/60 transition-colors"
                  >
                    <td className="py-4 px-6 font-bold text-[#34452F]">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#EAA34B]/15 text-[#D18A32] flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>

                        <div>
                          <div>{d.original_name}</div>
                          <div className="text-[10px] text-[#7D806B] font-normal">
                            {d.mime_type || 'Document'}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6 text-[#53602F] font-medium">
                      {(d.file_size / 1024).toFixed(1)} KB
                    </td>

                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#EAA34B]/15 text-[#9A641F] border border-[#EAA34B]/30">
                        <Database className="w-3 h-3" />
                        {d.chunk_count} Chunks
                      </span>
                    </td>

                    <td className="py-4 px-6 text-[#7D806B]">
                      {new Date(d.created_at).toLocaleDateString()}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="inline-flex items-center gap-2">

                        <button
                          onClick={() => viewExtractedText(d.id)}
                          className="p-1.5 text-[#7D806B] hover:text-[#476B3F] hover:bg-[#476B3F]/10 rounded-lg transition-colors cursor-pointer"
                          title="View Extracted Text"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <a
                          href={api.getDocumentDownloadUrl(d.id)}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-[#7D806B] hover:text-[#476B3F] hover:bg-[#476B3F]/10 rounded-lg transition-colors cursor-pointer"
                          title="Download Original"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>

                        <button
                          onClick={() => handleDelete(d.id, d.original_name)}
                          className="p-1.5 text-[#7D806B] hover:text-[#D94F1E] hover:bg-[#D94F1E]/10 rounded-lg transition-colors cursor-pointer"
                          title="Delete Document"
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
            <UploadCloud className="w-10 h-10 text-[#D9C9AD] mx-auto mb-2" />

            <h3 className="text-sm font-bold text-[#34452F]">
              No documents uploaded
            </h3>

            <p className="text-xs text-[#7D806B] mt-1 max-w-xs mx-auto">
              Upload case briefs, judgments, and legal deeds to enable contextual AI inquiries.
            </p>

            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="mt-4 px-4 py-2 bg-[#476B3F] hover:bg-[#34452F] text-white text-xs font-bold rounded-xl shadow-sm transition-colors cursor-pointer"
            >
              + Upload Document
            </button>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload Legal Document for Neural Indexing"
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4">

          <div className="border-2 border-dashed border-[#D9C9AD] rounded-2xl p-6 text-center hover:border-[#EAA34B] transition-colors bg-[#FFF8EC]">

            <input
              type="file"
              id="file-upload"
              accept=".pdf,.docx,.txt"
              onChange={handleFileChange}
              className="hidden"
            />

            <label htmlFor="file-upload" className="cursor-pointer block">
              <UploadCloud className="w-10 h-10 text-[#D18A32] mx-auto mb-2" />

              {selectedFile ? (
                <div>
                  <p className="text-xs font-bold text-[#34452F]">
                    {selectedFile.name}
                  </p>

                  <p className="text-[11px] text-[#7D806B] mt-0.5">
                    {(selectedFile.size / 1024).toFixed(1)} KB • Click to choose another
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-xs font-bold text-[#34452F]">
                    Click to select PDF, DOCX, or TXT
                  </p>

                  <p className="text-[11px] text-[#7D806B] mt-0.5">
                    PyMuPDF & python-docx will automatically extract and chunk paragraphs
                  </p>
                </div>
              )}
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div>
              <label className="block text-xs font-semibold text-[#34452F] mb-1.5">
                Link to Case (Optional)
              </label>

              <select
                value={selectedCaseId}
                onChange={(e) => setSelectedCaseId(e.target.value)}
                className="w-full bg-[#FFF8EC] border border-[#E9DCC6] rounded-xl px-3 py-2 text-xs text-[#34452F] focus:outline-none focus:ring-2 focus:ring-[#EAA34B]/30 focus:border-[#EAA34B]"
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
              <label className="block text-xs font-semibold text-[#34452F] mb-1.5">
                Link to Client (Optional)
              </label>

              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full bg-[#FFF8EC] border border-[#E9DCC6] rounded-xl px-3 py-2 text-xs text-[#34452F] focus:outline-none focus:ring-2 focus:ring-[#EAA34B]/30 focus:border-[#EAA34B]"
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

          <div className="pt-3 border-t border-[#E9DCC6] flex items-center justify-end gap-3">

            <button
              type="button"
              onClick={() => setIsUploadModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-[#7D806B] hover:text-[#34452F] hover:bg-[#F8EFDF] rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!selectedFile || uploading}
              className="px-5 py-2 text-xs font-bold text-white bg-[#476B3F] hover:bg-[#34452F] rounded-xl shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
            >
              {uploading ? 'Extracting & Indexing...' : 'Upload & Process'}
            </button>

          </div>
        </form>
      </Modal>

      {/* Extracted Text Preview */}
      <Modal
        isOpen={Boolean(viewingDoc)}
        onClose={() => setViewingDoc(null)}
        title={`Extracted Text: ${viewingDoc?.original_name || 'Document'}`}
        maxWidth="max-w-3xl"
      >
        <div className="space-y-3">

          <div className="flex items-center justify-between text-xs text-[#7D806B] pb-2 border-b border-[#E9DCC6]">
            <span>
              Size: {((viewingDoc?.file_size || 0) / 1024).toFixed(1)} KB
            </span>

            <span className="font-semibold text-[#9A641F]">
              {viewingDoc?.chunk_count} RAG Chunks Generated
            </span>
          </div>

          <div className="bg-[#FFF8EC] border border-[#E9DCC6] rounded-xl p-4 max-h-[55vh] overflow-y-auto text-xs text-[#34452F] whitespace-pre-wrap font-mono leading-relaxed">
            {viewingDoc?.extracted_text || '[No text could be extracted from this document]'}
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => setViewingDoc(null)}
              className="px-4 py-2 text-xs font-bold text-white bg-[#476B3F] hover:bg-[#34452F] rounded-xl transition-colors cursor-pointer"
            >
              Close Viewer
            </button>
          </div>

        </div>
      </Modal>

    </div>
  );
};