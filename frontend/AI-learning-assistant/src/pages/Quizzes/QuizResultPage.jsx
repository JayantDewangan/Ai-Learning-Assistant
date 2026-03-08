import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import quizService from '../../services/quizService';
import toast from 'react-hot-toast';
import { ArrowLeft, Trophy, CheckCircle2, XCircle, BookOpen } from 'lucide-react';

const QuizResultPage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchResults(); }, [quizId]);

  const fetchResults = async () => {
    try {
      const response = await quizService.getQuizResults(quizId);
      setResult(response?.data || response);
    } catch (error) {
      toast.error('Failed to load results');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!result) return null;

  const quiz = result.quiz;
  const detailedResults = result.results || [];
  const total = quiz?.totalQuestions || 0;
  const pct = quiz?.score ?? 0;
  const correct = Math.round((pct / 100) * total);
  const incorrect = total - correct;
  const documentId = quiz?.document?._id || quiz?.document;

  const getMessage = () => {
    if (pct >= 80) return 'Excellent work!';
    if (pct >= 60) return 'Good job!';
    return 'Keep practicing!';
  };

  const getScoreColor = () => {
    if (pct >= 80) return 'text-emerald-500';
    if (pct >= 60) return 'text-indigo-500';
    return 'text-red-500';
  };

  return (
    <div className="h-full overflow-y-auto bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">

        <button
          onClick={() => navigate(`/documents/${documentId}`)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-8 text-sm font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Document
        </button>

        <h1 className="text-xl font-bold text-slate-900 mb-6">{quiz?.title || 'Quiz Results'}</h1>

        {/* Score card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm mb-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8 text-indigo-500" strokeWidth={1.5} />
          </div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">YOUR SCORE</p>
          <p className={`text-5xl font-bold mb-2 ${getScoreColor()}`}>{pct}%</p>
          <p className="text-slate-500 text-sm font-medium mb-6">{getMessage()}</p>

          <div className="flex items-center justify-center gap-3 flex-wrap">
            <span className="flex items-center gap-1.5 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700">
              <BookOpen className="w-4 h-4 text-slate-400" strokeWidth={2} />
              {total} Total
            </span>
            <span className="flex items-center gap-1.5 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-sm font-semibold text-emerald-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" strokeWidth={2} />
              {correct} Correct
            </span>
            <span className="flex items-center gap-1.5 px-4 py-2 bg-red-50 border border-red-200 rounded-xl text-sm font-semibold text-red-700">
              <XCircle className="w-4 h-4 text-red-500" strokeWidth={2} />
              {incorrect} Incorrect
            </span>
          </div>
        </div>

        {/* Detailed review */}
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-slate-400" strokeWidth={2} />
          Detailed Review
        </h2>

        <div className="space-y-4 mb-10">
          {detailedResults.map((q, i) => {
            const userAnswer = q.selectedAnswer;
            const correctAnswer = q.correctAnswer;
            const isCorrect = q.isCorrect;

            return (
              <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-lg">
                    Question {i + 1}
                  </span>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    isCorrect ? 'bg-emerald-100' : 'bg-red-100'
                  }`}>
                    {isCorrect
                      ? <CheckCircle2 className="w-4 h-4 text-emerald-500" strokeWidth={2} />
                      : <XCircle className="w-4 h-4 text-red-500" strokeWidth={2} />
                    }
                  </div>
                </div>

                <p className="text-slate-900 font-semibold mb-4 leading-relaxed">{q.question}</p>

               <div className="space-y-2 mb-4">
                  {q.options.map((opt, oi) => {
                    const normalizeStr = (str) =>
                      (str || '')
                        .toString()
                        .trim()
                        .toLowerCase()
                        .replace(/\s+/g, ' ');
                    
                    const isUserAnswer = opt === userAnswer;
                    const isCorrectAnswer = opt === correctAnswer;

                    let cls = 'border-slate-200 bg-white text-slate-700';
                    let badge = null;

                    if (opt === userAnswer && isCorrect) {
                      cls = 'border-emerald-400 bg-emerald-50 text-emerald-900';
                      badge = (
                        <span className="ml-auto text-xs font-semibold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-lg flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />Your Answer
                        </span>
                      );
                    }
                    else if (opt === correctAnswer) {
                      cls = 'border-emerald-400 bg-emerald-50 text-emerald-900';
                      badge = (
                        <span className="ml-auto text-xs font-semibold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-lg flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />Correct
                        </span>
                      );
                    }
                    else if (opt === userAnswer && !isCorrect) {
                      cls = 'border-red-400 bg-red-50 text-red-900';
                      badge = (
                        <span className="ml-auto text-xs font-semibold text-red-600 bg-red-100 px-2 py-0.5 rounded-lg flex items-center gap-1">
                          <XCircle className="w-3 h-3" />Your Answer
                        </span>
                      );
                    }

                    return (
                      <div key={oi} className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-sm font-medium ${cls}`}>
                        <span className="flex-1">{opt}</span>
                        {badge}
                      </div>
                    );
                  })}
                </div>

                {q.explanation && (
                  <div className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <BookOpen className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" strokeWidth={2} />
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Explanation</p>
                      <p className="text-sm text-slate-700 leading-relaxed">{q.explanation}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Return button */}
        <div className="flex justify-center">
          <button
            onClick={() => navigate(`/documents/${documentId}`)}
            className="flex items-center gap-2 px-8 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-xl transition-colors"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={2} />
            Return to Document
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizResultPage;