import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import flashcardService from '../../services/flashCardService';
import toast from 'react-hot-toast';
import { BookOpen, Brain, Trash2, Plus } from 'lucide-react';

const FlashcardsListPage = () => {
  const navigate = useNavigate();
  const [sets, setSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteSetId, setDeleteSetId] = useState(null);
  const [deletingSet, setDeletingSet] = useState(false);

  useEffect(() => {
    fetchAllSets();
  }, []);

  const fetchAllSets = async () => {
    try {
      const response = await flashcardService.getAllFlashcardSets();
      const data = response?.data || response || [];
      setSets(Array.isArray(data) ? data : []);
    } catch (error) {
      setSets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSet = async () => {
    if (!deleteSetId) return;
    setDeletingSet(true);
    try {
      await flashcardService.deleteFlashcardSet(deleteSetId);
      toast.success('Flashcard set deleted');
      setSets(prev => prev.filter(s => s._id !== deleteSetId));
    } catch (error) {
      toast.error('Failed to delete flashcard set');
    } finally {
      setDeletingSet(false);
      setDeleteSetId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">All Flashcard Sets</h1>
          <p className="text-slate-500 text-sm mt-1">{sets.length} set{sets.length !== 1 ? 's' : ''} available</p>
        </div>
      </div>

      {sets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-20 h-20 rounded-2xl bg-indigo-100 flex items-center justify-center mb-5">
            <Brain className="w-10 h-10 text-indigo-500" strokeWidth={1.5} />
          </div>
          <p className="text-slate-800 font-bold text-xl mb-2">No Flashcard Sets Yet</p>
          <p className="text-slate-400 text-sm text-center max-w-xs mb-8">
            Go to a document and generate flashcards to start studying.
          </p>
          <button
            onClick={() => navigate('/documents')}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" strokeWidth={2} />
            Go to Documents
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {sets.map((set) => (
            <div
              key={set._id}
              className="relative bg-white border-2 border-indigo-200 hover:border-indigo-400 rounded-2xl p-5 cursor-pointer transition-all hover:shadow-md group"
            >
              {/* Delete button */}
              <button
                onClick={(e) => { e.stopPropagation(); setDeleteSetId(set._id); }}
                className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-4 h-4" strokeWidth={2} />
              </button>

              {/* Icon */}
              <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center mb-4">
                <BookOpen className="w-5 h-5 text-indigo-500" strokeWidth={2} />
              </div>

              {/* Info */}
              <h3 className="font-semibold text-slate-900 mb-0.5 pr-6 truncate">
                {set.documentId?.title || 'Flashcard Set'}
              </h3>
              <p className="text-xs text-slate-400 uppercase tracking-wide mb-3">
                Created {new Date(set.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
              </p>

              <div className="flex items-center gap-2 mb-4">
                <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-semibold rounded-lg">
                  {set.cards?.length || 0} Cards
                </span>
                {(() => {
                  const reviewed = set.cards?.filter(c => c.reviewCount > 0).length || 0;
                  const total = set.cards?.length || 0;
                  const pct = total ? Math.round((reviewed / total) * 100) : 0;
                  return pct > 0 ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-semibold rounded-lg">
                      ↗ {pct}%
                    </span>
                  ) : null;
                })()}
              </div>

              {/* Progress */}
              {(() => {
                const reviewed = set.cards?.filter(c => c.reviewCount > 0).length || 0;
                const total = set.cards?.length || 0;
                return (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-500">Progress</span>
                      <span className="text-xs text-slate-500">{reviewed}/{total} reviewed</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full">
                      <div
                        className="h-1.5 bg-indigo-500 rounded-full transition-all"
                        style={{ width: `${total ? (reviewed / total) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                );
              })()}

              {/* Study Now */}
              <button
                onClick={() => navigate(`/documents/${set.documentId?._id || set.documentId}/flashcards?setId=${set._id}`)}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-50 hover:bg-indigo-500 text-indigo-600 hover:text-white font-semibold rounded-xl transition-colors text-sm cursor-pointer"
              >
                <Brain className="w-4 h-4" strokeWidth={2} />
                Study Now
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Delete modal */}
      {deleteSetId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-2">Delete Flashcard Set?</h2>
            <p className="text-sm text-slate-600 mb-6">
              Are you sure you want to delete this flashcard set? This action cannot be undone and all cards will be permanently removed.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button onClick={() => setDeleteSetId(null)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                Cancel
              </button>
              <button onClick={handleDeleteSet} disabled={deletingSet}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white text-sm font-semibold rounded-xl transition-colors">
                {deletingSet
                  ? (<><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Deleting...</>)
                  : 'Delete Set'
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlashcardsListPage;