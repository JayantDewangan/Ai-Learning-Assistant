import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import documentService from '../../services/documentService';
import toast from 'react-hot-toast';
import {
  FileText,
  Upload,
  Trash2,
  Clock,
  BookOpen,
  BrainCircuit,
  Plus,
  X,
} from 'lucide-react';

const DocumentListPage = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentTitle, setDocumentTitle] = useState('');
  const [deleteDocId, setDeleteDocId] = useState(null);
  const [deleteDocTitle, setDeleteDocTitle] = useState('');
  const [deletingDoc, setDeletingDoc] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await documentService.getAllDocuments();
      setDocuments(response?.data || []);
    } catch (error) {
      toast.error(error?.error || 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file');
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setSelectedFile(file);
    setDocumentTitle(file.name.replace('.pdf', ''));
    setShowUploadModal(true);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setSelectedFile(file);
    setDocumentTitle(file.name.replace('.pdf', ''));
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleUpload = async () => {
    if (!selectedFile || !documentTitle.trim()) {
      toast.error('Please provide a document title');
      return;
    }

    setUploading(true);
    const uploadToast = toast.loading('Uploading document...');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', documentTitle.trim());

      await documentService.uploadDocument(formData);
      toast.success('Document uploaded successfully!', { id: uploadToast });
      
      // Reset and close modal
      setShowUploadModal(false);
      setSelectedFile(null);
      setDocumentTitle('');
      
      fetchDocuments(); // Refresh list
    } catch (error) {
      toast.error(error?.error || 'Upload failed', { id: uploadToast });
    } finally {
      setUploading(false);
    }
  };

  const handleCancelUpload = () => {
    setShowUploadModal(false);
    setSelectedFile(null);
    setDocumentTitle('');
  };

  const handleDelete = (documentId, documentTitle, event) => {
    event.stopPropagation();
    setDeleteDocId(documentId);
    setDeleteDocTitle(documentTitle);
  };

  const confirmDelete = async () => {
    const deleteToast = toast.loading('Deleting document...');
    setDeletingDoc(true);
    try {
      await documentService.deleteDocument(deleteDocId);
      toast.success('Document deleted', { id: deleteToast });
      setDocuments(documents.filter(doc => doc._id !== deleteDocId));
    } catch (error) {
      toast.error('Failed to delete document', { id: deleteToast });
    } finally {
      setDeletingDoc(false);
      setDeleteDocId(null);
      setDeleteDocTitle('');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (date) => {
    const now = new Date();
    const uploaded = new Date(date);
    const diffInMinutes = Math.floor((now - uploaded) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;

    return uploaded.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Documents</h1>
            <p className="text-slate-500 text-sm mt-1">Manage and organize your learning materials</p>
          </div>

          {/* Upload Button */}
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm bg-indigo-500 text-white hover:bg-indigo-600 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            Upload Document
          </button>
        </div>

        {/* Documents Grid */}
        {documents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {documents.map((doc) => (
              <div
                key={doc._id}
                onClick={() => navigate(`/documents/${doc._id}`)}
                className="group relative bg-white rounded-2xl border border-slate-200 p-5 cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-slate-300"
              >
                {/* Delete Button */}
                <button
                  onClick={(e) => handleDelete(doc._id, doc.title, e)}
                  className="absolute top-3 right-3 p-1.5 rounded-lg bg-white text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500 hover:bg-red-50 border border-slate-200"
                >
                  <Trash2 className="w-4 h-4" strokeWidth={2} />
                </button>

                {/* Document Icon */}
                <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-500 mb-3">
                  <FileText className="w-7 h-7 text-white" strokeWidth={2} />
                </div>

                {/* Document Title */}
                <h3 className="text-base font-semibold text-slate-900 mb-1 line-clamp-2 pr-6">
                  {doc.title}
                </h3>

                {/* File Size */}
                <p className="text-sm text-slate-500 mb-3">
                  {formatFileSize(doc.fileSize)}
                </p>

                {/* Stats */}
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700">
                    <BookOpen className="w-3.5 h-3.5" strokeWidth={2} />
                    <span className="text-xs font-semibold">
                      {doc.flashcardCount || 0} Flashcards
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700">
                    <BrainCircuit className="w-3.5 h-3.5" strokeWidth={2} />
                    <span className="text-xs font-semibold">
                      {doc.quizCount || 0} Quizzes
                    </span>
                  </div>
                </div>

                {/* Upload Date */}
                <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                  <Clock className="w-3.5 h-3.5" strokeWidth={2} />
                  <span>Uploaded {formatDate(doc.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Empty State
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-slate-100 mb-4">
              <Upload className="w-10 h-10 text-slate-400" strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No documents yet</h3>
            <p className="text-slate-500 text-center mb-6 max-w-sm">
              Upload your first PDF document to start learning with AI-powered tools
            </p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-500 text-white rounded-xl font-semibold hover:bg-indigo-600 transition-colors shadow-sm"
            >
              <Plus className="w-5 h-5" strokeWidth={2.5} />
              Upload Your First Document
            </button>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900">Upload New Document</h2>
              <button
                onClick={handleCancelUpload}
                className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5 space-y-4">
              <p className="text-sm text-slate-500">Add a PDF document to your library</p>

              {/* Document Title Input */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  DOCUMENT TITLE
                </label>
                <input
                  type="text"
                  value={documentTitle}
                  onChange={(e) => setDocumentTitle(e.target.value)}
                  placeholder="Enter document title"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-900"
                />
              </div>

              {/* File Upload Area */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  PDF FILE
                </label>
                
                {!selectedFile ? (
                  <label
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    className="cursor-pointer"
                  >
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-indigo-500 hover:bg-indigo-50/50 transition-colors">
                      <Upload className="w-12 h-12 text-indigo-500 mx-auto mb-3" strokeWidth={1.5} />
                      <p className="text-sm font-medium text-slate-700 mb-1">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-slate-500">PDF up to 10MB</p>
                    </div>
                  </label>
                ) : (
                  <div className="border-2 border-indigo-500 rounded-xl p-6 text-center bg-indigo-50">
                    <FileText className="w-12 h-12 text-indigo-500 mx-auto mb-2" strokeWidth={1.5} />
                    <p className="text-sm font-semibold text-indigo-700 mb-1">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-indigo-600">
                      PDF up to {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center gap-3 px-6 py-4 border-t border-slate-200">
              <button
                onClick={handleCancelUpload}
                disabled={uploading}
                className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={uploading || !selectedFile || !documentTitle.trim()}
                className="flex-1 px-4 py-2.5 bg-indigo-500 text-white font-semibold rounded-xl hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Uploading...
                  </>
                ) : (
                  'Upload'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
            {/* Delete Confirmation Modal */}
      {deleteDocId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">Delete Document?</h2>
              <button
                onClick={() => { setDeleteDocId(null); setDeleteDocTitle(''); }}
                className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <p className="text-sm text-slate-600 mb-1">
              Are you sure you want to delete
            </p>
            <p className="text-sm font-semibold text-slate-900 mb-4">
              "{deleteDocTitle}"?
            </p>
            <p className="text-sm text-slate-500 mb-6">
              This action cannot be undone. All associated flashcards and quizzes will also be removed.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => { setDeleteDocId(null); setDeleteDocTitle(''); }}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deletingDoc}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                {deletingDoc
                  ? (<><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Deleting...</>)
                  : 'Delete Document'
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DocumentListPage;