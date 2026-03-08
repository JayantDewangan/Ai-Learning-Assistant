import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import flashcardService from '../../services/flashCardService';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Star,
} from 'lucide-react';

const FlashcardPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setId = searchParams.get('setId');

  const [set, setSet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    fetchSet();
  }, [id]);

  const fetchSet = async () => {
    try {
      const response = await flashcardService.getFlashcardsForDocument(id);
      const sets = response?.data || response || [];
      const allSets = Array.isArray(sets) ? sets : [sets];
      // If setId provided, find that specific set, else use first
      const target = setId
        ? allSets.find(s => s._id === setId)
        : allSets[0];
      setSet(target || null);
    } catch (error) {
      toast.error('Failed to load flashcards');
      navigate(`/documents/${id}`);
    } finally {
      setLoading(false);
    }
  };

  const handleNextCard = () => {
    if (!set) return;
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentCardIndex(prev =>
        prev < set.cards.length - 1 ? prev + 1 : prev
      );
    }, 150);
  };

  const handlePrevCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentCardIndex(prev => (prev > 0 ? prev - 1 : prev));
    }, 150);
  };

  const handleToggleStar = async (cardId) => {
    setSet(prev => ({
      ...prev,
      cards: prev.cards.map(c =>
        c._id === cardId ? { ...c, isStarred: !c.isStarred } : c
      ),
    }));
    try {
      await flashcardService.toggleStar(cardId);
    } catch (error) {
      setSet(prev => ({
        ...prev,
        cards: prev.cards.map(c =>
          c._id === cardId ? { ...c, isStarred: !c.isStarred } : c
        ),
      }));
      toast.error('Failed to update star');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!set || !set.cards?.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-slate-500">No flashcards found.</p>
        <button
          onClick={() => navigate(`/documents/${id}`)}
          className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded-xl text-sm font-semibold"
        >
          Back to Document
        </button>
      </div>
    );
  }

  const currentCard = set.cards[currentCardIndex];

  return (
    <div className="h-full overflow-y-auto bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">

        {/* Back button */}
        <button
          onClick={() => navigate(`/documents/${id}`)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-8 text-sm font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Document
        </button>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-slate-200 rounded-full mb-8">
          <div
            className="h-1.5 bg-indigo-500 rounded-full transition-all duration-300"
            style={{ width: `${((currentCardIndex + 1) / set.cards.length) * 100}%` }}
          />
        </div>

        {/* Flip card */}
        <div
          className="cursor-pointer mx-auto"
          style={{ perspective: '1200px' }}
          onClick={() => {
            if (!isFlipped) {
              flashcardService.reviewFlashcard(currentCard._id).catch(() => {});
              setSet(prev => ({
                ...prev,
                cards: prev.cards.map(c =>
                  c._id === currentCard._id
                    ? { ...c, reviewCount: (c.reviewCount || 0) + 1 }
                    : c
                ),
              }));
            }
            setIsFlipped(f => !f);
          }}
        >
          <div
            className="relative w-full transition-transform duration-500 flex flex-col"
            style={{
              transformStyle: 'preserve-3d',
              transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              minHeight: '320px',
            }}
          >
            {/* Front — answer */}
            <div
              className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-indigo-500 px-8 py-10 shadow-lg"
              style={{ backfaceVisibility: 'hidden' }}
            >
              {currentCard?.difficulty && (
                <span className="absolute top-4 left-4 px-2.5 py-1 bg-white/20 text-white text-xs font-semibold rounded-lg uppercase tracking-wide">
                  {currentCard.difficulty}
                </span>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); handleToggleStar(currentCard._id); }}
                className={`absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                  currentCard?.isStarred ? 'bg-yellow-400 text-white' : 'bg-white/20 text-white/70 hover:bg-white/30'
                }`}
              >
                <Star className="w-4 h-4" fill={currentCard?.isStarred ? 'currentColor' : 'none'} strokeWidth={2} />
              </button>
                <p className="text-white text-xl font-semibold text-center  leading-relaxed wrap-break-word overflow-y-auto max-h-55 px-2">
                  {currentCard?.question}
                </p>
              <div className="flex items-center gap-1.5 mt-6 text-white/70 text-xs">
                <RotateCcw className="w-3.5 h-3.5" strokeWidth={2} />
                Click to see answer
              </div>
            </div>

            {/* Back — question */}
            <div
              className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-white border border-slate-200 px-8 py-10 shadow-lg"
              style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            >
              {currentCard?.difficulty && (
                <span className="absolute top-4 left-4 px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-lg uppercase tracking-wide">
                  {currentCard.difficulty}
                </span>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); handleToggleStar(currentCard._id); }}
                className={`absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                  currentCard?.isStarred ? 'bg-yellow-400 text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                }`}
              >
                <Star className="w-4 h-4" fill={currentCard?.isStarred ? 'currentColor' : 'none'} strokeWidth={2} />
              </button>
              <p className="text-slate-800 text-xl font-semibold text-center leading-relaxed wrap-break-word overflow-y-auto max-h-55 px-2">
                {currentCard?.answer}
              </p>
              <div className="flex items-center gap-1.5 mt-6 text-slate-400 text-xs">
                <RotateCcw className="w-3.5 h-3.5" strokeWidth={2} />
                Click to reveal question
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={handlePrevCard}
            disabled={currentCardIndex === 0}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 font-medium rounded-xl transition-colors text-sm"
          >
            <ChevronLeft className="w-4 h-4" strokeWidth={2} />
            Previous
          </button>
          <span className="text-sm font-semibold text-slate-600 min-w-16 text-center">
            {currentCardIndex + 1} / {set.cards.length}
          </span>
          <button
            onClick={handleNextCard}
            disabled={currentCardIndex === set.cards.length - 1}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 font-medium rounded-xl transition-colors text-sm"
          >
            Next
            <ChevronRight className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FlashcardPage;