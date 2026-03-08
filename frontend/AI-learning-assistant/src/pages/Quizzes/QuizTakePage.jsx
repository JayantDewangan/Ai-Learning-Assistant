import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import quizService from '../../services/quizService';
import toast from 'react-hot-toast';
import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';

const QuizTakePage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchQuiz(); }, [quizId]);

  const fetchQuiz = async () => {
    try {
      const response = await quizService.getQuizById(quizId);
      setQuiz(response?.data || response);
    } catch (error) {
      toast.error('Failed to load quiz');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnswer = (questionIndex, option) => {
    setAnswers(prev => ({ ...prev, [questionIndex]: option }));
  };

  const handleSubmit = async () => {
    const total = quiz?.questions?.length || 0;
    if (Object.keys(answers).length < total) {
      toast.error(`Please answer all ${total} questions before submitting`);
      return;
    }
    setSubmitting(true);
    try {
      const answersArray = quiz.questions.map((question, i) => ({
        questionId: question._id,  // ← This is what the backend expects!
        selectedAnswer: answers[i] || '',
      }));
      await quizService.submitQuiz(quizId, answersArray);
      toast.success('Quiz submitted successfully!');
      navigate(`/quizzes/${quizId}/results`);
    } catch (error) {
      toast.error('Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!quiz) return null;

  const questions = quiz.questions || [];
  const current = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const isLast = currentIndex === questions.length - 1;

  return (
    <div className="h-full overflow-y-auto bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">

        {/* Title */}
        <h1 className="text-xl font-bold text-slate-900 mb-1">{quiz.title || 'Quiz'}</h1>

        {/* Progress info */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-slate-500 font-medium">
            Question {currentIndex + 1} of {questions.length}
          </span>
          <span className="text-sm text-slate-500 font-medium">
            {answeredCount} answered
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-slate-100 rounded-full mb-8">
          <div
            className="h-1.5 bg-indigo-500 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>

        {/* Question card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-6">
          <div className="mb-5">
            <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-semibold rounded-lg mb-4">
              Question {currentIndex + 1}
            </span>
            <p className="text-lg font-semibold text-slate-900 leading-relaxed">
              {current.question}
            </p>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {current.options.map((option, optIndex) => {
              const isSelected = answers[currentIndex] === option;
              return (
                <button
                  key={optIndex}
                  onClick={() => handleSelectAnswer(currentIndex, option)}
                  className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border-2 text-left transition-all duration-150 ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/50'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                    isSelected ? 'border-indigo-500 bg-indigo-500' : 'border-slate-300'
                  }`}>
                    {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                  <span className="text-sm font-medium">{option}</span>
                  {isSelected && (
                    <CheckCircle2 className="w-4 h-4 text-indigo-500 ml-auto shrink-0" strokeWidth={2} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        {/* Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

  {/* Previous */}
  <button
    onClick={() => setCurrentIndex(p => p - 1)}
    disabled={currentIndex === 0}
    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 font-medium rounded-xl transition-colors text-sm"
  >
    <ChevronLeft className="w-4 h-4" strokeWidth={2} />
    Previous
  </button>

  {/* Page numbers */}
  <div className="flex items-center justify-center gap-1.5 overflow-x-auto max-w-full px-1">
    {questions.map((_, i) => (
      <button
        key={i}
        onClick={() => setCurrentIndex(i)}
        className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all shrink-0 ${
          i === currentIndex
            ? 'bg-indigo-500 text-white'
            : answers[i]
            ? 'bg-indigo-100 text-indigo-600'
            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
        }`}
      >
        {i + 1}
      </button>
    ))}
  </div>

  {/* Next / Submit */}
  {isLast ? (
    <button
      onClick={handleSubmit}
      disabled={submitting}
      className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors text-sm"
    >
      {submitting ? (
        <>
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          Submitting...
        </>
      ) : (
        <>
          <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
          Submit Quiz
        </>
      )}
    </button>
  ) : (
    <button
      onClick={() => setCurrentIndex(p => p + 1)}
      className="flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors text-sm"
    >
      Next
      <ChevronRight className="w-4 h-4" strokeWidth={2} />
    </button>
  )}
        </div>
      </div>
    </div>
  );
};

export default QuizTakePage;