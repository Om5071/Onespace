import React, { useState, useEffect } from 'react';
import { documentApi } from '../api/documentApi';
import { useNotification } from '../context/NotificationContext';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import { Loader } from '../components/common/Loader';
import { PdfViewerModal } from '../components/pdfViewer/PdfViewerModal';
import { formatDate } from '../utils/formatDate';
import {
  FolderArchive,
  Upload,
  Search,
  FileText,
  File,
  Image as ImageIcon,
  Download,
  Trash2,
  Eye,
  Edit2
} from 'lucide-react';

export const DocumentsPage = () => {
  const [documents, setDocuments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Upload modal
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [category, setCategory] = useState('General');
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState('');
  const [uploading, setUploading] = useState(false);

  // Rename modal
  const [renamingDoc, setRenamingDoc] = useState(null);
  const [newFileName, setNewFileName] = useState('');

  // Preview modal
  const [previewDoc, setPreviewDoc] = useState(null);

  const { addToast } = useNotification();

  const fetchDocuments = async () => {
    try {
      const res = await documentApi.getDocuments({
        search: search || undefined,
        category: selectedCategory || undefined
      });
      if (res.success) {
        const docList = Array.isArray(res.data) ? res.data : (res.data?.documents || []);
        const catList = Array.isArray(res.data?.categories) ? res.data.categories : [];
        setDocuments(docList);
        setCategories(catList);
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to load documents', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [search, selectedCategory]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      addToast('Please select a file to upload', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('category', category);
    formData.append('notes', notes);
    formData.append('tags', tags);

    setUploading(true);
    try {
      await documentApi.uploadDocument(formData);
      addToast('File uploaded successfully', 'success');
      setIsUploadOpen(false);
      setUploadFile(null);
      setNotes('');
      setTags('');
      fetchDocuments();
    } catch (err) {
      addToast(err.message || 'Upload failed', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleRename = async (e) => {
    e.preventDefault();
    if (!renamingDoc || !newFileName.trim()) return;

    try {
      await documentApi.updateMetadata(renamingDoc._id, { originalName: newFileName.trim() });
      addToast('File renamed', 'success');
      setRenamingDoc(null);
      fetchDocuments();
    } catch (err) {
      addToast('Failed to rename file', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this file permanently?')) return;
    try {
      await documentApi.deleteDocument(id);
      setDocuments((prev) => prev.filter((d) => d._id !== id));
      addToast('Document deleted', 'success');
    } catch (err) {
      addToast('Failed to delete document', 'error');
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType = '') => {
    if (mimeType.includes('pdf')) return <FileText className="w-7 h-7 text-rose-400" />;
    if (mimeType.includes('image')) return <ImageIcon className="w-7 h-7 text-purple-400" />;
    return <File className="w-7 h-7 text-blue-400" />;
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Document Management</h1>
          <p className="text-xs text-slate-400 mt-0.5">Secure locker, file previews, and PDF viewer</p>
        </div>

        <Button variant="primary" icon={Upload} onClick={() => setIsUploadOpen(true)}>
          Upload File
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#101726] p-3 rounded-2xl border border-slate-800 shadow-xs">
        <div className="sm:col-span-2">
          <Input
            icon={Search}
            placeholder="Search documents by name or notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full h-9 rounded-xl border border-slate-700 bg-[#131D31] px-3 text-xs text-white focus:border-blue-500 focus:outline-none"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Documents Grid / Table */}
      {loading ? (
        <Loader size="lg" text="Loading files..." />
      ) : documents.length === 0 ? (
        <div className="text-center py-16 bg-[#101726] rounded-2xl border border-dashed border-slate-800">
          <FolderArchive className="w-12 h-12 mx-auto text-slate-600 mb-3" />
          <h3 className="text-sm font-semibold text-slate-300">No documents in locker</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Upload PDFs, images, certificates, or text documents.
          </p>
          <Button variant="primary" size="sm" icon={Upload} className="mt-4" onClick={() => setIsUploadOpen(true)}>
            Upload File
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {documents.map((doc) => (
            <div
              key={doc._id}
              className="bg-[#101726] rounded-2xl p-4 border border-slate-800 shadow-xs flex flex-col justify-between space-y-3 hover:border-slate-700 transition-all group"
            >
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-[#131D31] border border-slate-800 shrink-0">
                  {getFileIcon(doc.mimeType || doc.fileType)}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-xs text-white truncate" title={doc.originalName || doc.fileName}>
                    {doc.originalName || doc.fileName}
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">{formatFileSize(doc.fileSize)} • {doc.category || 'General'}</p>
                </div>
              </div>

              {doc.notes && (
                <p className="text-xs text-slate-400 line-clamp-2 bg-[#131D31] p-2.5 rounded-xl text-[11px] border border-slate-800/80">
                  {doc.notes}
                </p>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <span className="text-[10px] text-slate-500">{formatDate(doc.uploadDate || doc.createdAt)}</span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPreviewDoc(doc)}
                    className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-[#1A243B] rounded-lg cursor-pointer transition-colors"
                    title="Preview file"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setRenamingDoc(doc);
                      setNewFileName(doc.originalName || doc.fileName);
                    }}
                    className="p-1.5 text-slate-400 hover:text-purple-400 hover:bg-[#1A243B] rounded-lg cursor-pointer transition-colors"
                    title="Rename file"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <a
                    href={documentApi.downloadUrl(doc._id)}
                    download
                    className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-[#1A243B] rounded-lg transition-colors"
                    title="Download file"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => handleDelete(doc._id)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-[#1A243B] rounded-lg cursor-pointer transition-colors"
                    title="Delete file"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <Modal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} title="Upload Document">
        <form onSubmit={handleUpload} className="space-y-4">
          <div className="border-2 border-dashed border-slate-700 rounded-2xl p-6 text-center hover:border-blue-500 transition-colors bg-[#131D31]/40">
            <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
            <input
              type="file"
              id="doc-upload"
              onChange={(e) => setUploadFile(e.target.files[0])}
              className="hidden"
            />
            <label
              htmlFor="doc-upload"
              className="cursor-pointer text-xs font-semibold text-blue-400 hover:underline"
            >
              {uploadFile ? uploadFile.name : 'Choose a file or drag it here'}
            </label>
            <p className="text-[10px] text-slate-500 mt-1">PDF, DOC, Images, Text up to 25MB</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Category"
              placeholder="e.g. Work, Bills, Legal"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
            <Input
              label="Tags"
              placeholder="tax, receipt, 2026"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Notes / Description
            </label>
            <textarea
              rows={2}
              placeholder="Add key notes or context..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-[#131D31] px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
            <Button type="button" variant="ghost" onClick={() => setIsUploadOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={uploading}>
              Upload File
            </Button>
          </div>
        </form>
      </Modal>

      {/* Rename Modal */}
      {renamingDoc && (
        <Modal isOpen={!!renamingDoc} onClose={() => setRenamingDoc(null)} title="Rename File">
          <form onSubmit={handleRename} className="space-y-4">
            <Input
              label="File Name"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              required
              autoFocus
            />
            <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
              <Button type="button" variant="ghost" onClick={() => setRenamingDoc(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Rename
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* PDF & Image Viewer Modal */}
      <PdfViewerModal
        doc={previewDoc}
        isOpen={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
      />
    </div>
  );
};
