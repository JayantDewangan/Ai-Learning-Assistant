import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import documentService from '../../services/documentService';
import flashcardService from '../../services/flashCardService';
import aiService from '../../services/aiService';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  ExternalLink,
  FileText,
  MessageSquare,
  Sparkles,
  BookOpen,
  BrainCircuit,
  Send,
  BotMessageSquare,
  X,
  Plus,
  Trash2,
  Brain,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ReactMarkdown from 'react-markdown';
import quizService from '../../services/quizService';
import { Play, BarChart2 } from 'lucide-react'

const DocumentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('content');

  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const [summary, setSummary] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [concept, setConcept] = useState('');
  const [explanation, setExplanation] = useState('');
  const [explainLoading, setExplainLoading] = useState(false);

  const [flashcardSets, setFlashcardSets] = useState([]);
  const [flashcardsLoading, setFlashcardsLoading] = useState(false);
  const [generatingFlashcards, setGeneratingFlashcards] = useState(false);
  const [deleteSetId, setDeleteSetId] = useState(null);
  const [deletingSet, setDeletingSet] = useState(false);

  const [quizzes, setQuizzes] = useState([]);
  const [quizzesLoading, setQuizzesLoading] = useState(false);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [quizQuestionCount, setQuizQuestionCount] = useState(5);
  const [deleteQuizId, setDeleteQuizId] = useState(null);
  const [deletingQuiz, setDeletingQuiz] = useState(false);

  useEffect(() => { fetchDocument(); }, [id]);
  useEffect(() => { if (activeTab === 'flashcards') fetchFlashcardSets(); }, [activeTab]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  useEffect(() => { if (activeTab === 'quizzes') fetchQuizzes(); }, [activeTab]);

  const fetchDocument = async () => {
    try {
      const response = await documentService.getDocumentById(id);
      setDocument(response?.data);
    } catch (error) {
      toast.error('Failed to load document');
      navigate('/documents');
    } finally {
      setLoading(false);
    }
  };

  const fetchFlashcardSets = async () => {
    setFlashcardsLoading(true);
    try {
      const response = await flashcardService.getFlashcardsForDocument(id);
      const sets = response?.data || response || [];
      setFlashcardSets(Array.isArray(sets) ? sets : [sets]);
    } catch (error) {
      setFlashcardSets([]);
    } finally {
      setFlashcardsLoading(false);
    }
  };

  const handleGenerateFlashcards = async () => {
    setGeneratingFlashcards(true);
    try {
      await aiService.generateFlashcards(id, { count: 10 });
      toast.success('Flashcards generated!');
      await fetchFlashcardSets();
    } catch (error) {
      toast.error(error?.message || 'Failed to generate flashcards');
    } finally {
      setGeneratingFlashcards(false);
    }
  };

  const handleDeleteSet = async () => {
    if (!deleteSetId) return;
    setDeletingSet(true);
    try {
      await flashcardService.deleteFlashcardSet(deleteSetId);
      toast.success('Flashcard set deleted');
      setFlashcardSets(prev => prev.filter(s => s._id !== deleteSetId));
    } catch (error) {
      toast.error('Failed to delete flashcard set');
    } finally {
      setDeletingSet(false);
      setDeleteSetId(null);
    }
  };

  const handleSendMessage = async () => {
    const trimmed = inputMessage.trim();
    if (!trimmed || chatLoading) return;
    setMessages(prev => [...prev, { role: 'user', content: trimmed, timestamp: new Date().toISOString() }]);
    setInputMessage('');
    setChatLoading(true);
    try {
      const response = await aiService.chat(id, trimmed);
      const answer = response?.data?.answer || response?.answer || 'No response received.';
      setMessages(prev => [...prev, { role: 'assistant', content: answer, timestamp: new Date().toISOString() }]);
    } catch (error) {
      toast.error('Failed to get response');
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I could not process your request. Please try again.', timestamp: new Date().toISOString(), isError: true }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }
  };

  const handleGenerateSummary = async () => {
    setSummaryLoading(true);
    try {
      const response = await aiService.generateSummary(id);
      setSummary(response?.data?.summary || response?.summary || 'No summary generated.');
      toast.success('Summary generated successfully!');
    } catch (error) {
      toast.error(error?.error || 'Failed to generate summary');
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleExplain = async () => {
    if (!concept.trim()) { toast.error('Please enter a concept'); return; }
    setExplainLoading(true);
    try {
      const response = await aiService.explainConcept(id, concept.trim());
      setExplanation(response?.data?.explanation || response?.explanation || 'No explanation generated.');
      toast.success('Explanation generated!');
    } catch (error) {
      toast.error(error?.error || 'Failed to explain concept');
    } finally {
      setExplainLoading(false);
    }
  };

  const handleExplainKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleExplain(); }
  };

  const fetchQuizzes = async () => {
    setQuizzesLoading(true);
    try {
      const response = await quizService.getQuizzesForDocument(id);
      setQuizzes(response?.data || response || []);
    } catch (error) {
      setQuizzes([]);
    } finally {
      setQuizzesLoading(false);
    }
  };

  const handleGenerateQuiz = async () => {
    setGeneratingQuiz(true);
    setShowQuizModal(false);
    const t = toast.loading('Generating quiz...');
    try {
      await aiService.generateQuiz(id, { numQuestions: quizQuestionCount });
      toast.success('Quiz generated!', { id: t });
      await fetchQuizzes();
    } catch (error) {
      toast.error('Failed to generate quiz', { id: t });
    } finally {
      setGeneratingQuiz(false);
    }
  };

  const handleDeleteQuiz = async () => {
    if (!deleteQuizId) return;
    setDeletingQuiz(true);
    try {
      await quizService.deleteQuiz(deleteQuizId);
      toast.success('Quiz deleted');
      setQuizzes(prev => prev.filter(q => q._id !== deleteQuizId));
    } catch (error) {
      toast.error('Failed to delete quiz');
    } finally {
      setDeletingQuiz(false);
      setDeleteQuizId(null);
    }
  };

  const tabs = [
    { id: 'content', label: 'Content', icon: FileText },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'ai-actions', label: 'AI Actions', icon: Sparkles },
    { id: 'flashcards', label: 'Flashcards', icon: BookOpen },
    { id: 'quizzes', label: 'Quizzes', icon: BrainCircuit },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!document) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <FileText className="w-16 h-16 text-slate-300 mb-4" />
        <p className="text-slate-500">Document not found</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <div className="shrink-0 bg-white border-b border-slate-200 px-4 sm:px-6 py-4">
        <button
          onClick={() => navigate('/documents')}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Documents</span>
        </button>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4">{document.title}</h1>
        <div className="overflow-x-auto scrollbar-hide -mt-4 -mb-4">
          <div className="flex items-center gap-1 min-w-max border-b border-slate-200">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                  }`}
                >
                  <Icon className="w-4 h-4" strokeWidth={2} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 min-h-0 overflow-hidden">

        {/* Content Tab */}
        {activeTab === 'content' && (
          <div className="h-full flex flex-col overflow-hidden">
            <div className="shrink-0 bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-700">Document Viewer</h2>
              <a href={document.filePath} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="hidden sm:inline">Open in new tab</span>
                <span className="sm:hidden">Open</span>
              </a>
            </div>
            <div className="flex-1 bg-slate-100 overflow-hidden">
              {document.status === 'ready' ? (
                <iframe src={document.filePath} className="w-full h-full border-0" title={document.title} />
              ) : document.status === 'processing' ? (
                <div className="flex flex-col items-center justify-center h-full px-4">
                  <div className="w-12 h-12 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4" />
                  <p className="text-slate-600 font-medium text-center">Processing document...</p>
                  <p className="text-slate-400 text-sm mt-2 text-center">This may take a few moments</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full px-4">
                  <FileText className="w-16 h-16 text-red-300 mb-4" />
                  <p className="text-slate-600 font-medium text-center">Failed to process document</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Chat Tab */}
        {activeTab === 'chat' && (
          <div className="h-125 flex flex-col bg-white overflow-hidden">
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-6">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center mb-4">
                    <MessageSquare className="w-8 h-8 text-indigo-500" strokeWidth={1.5} />
                  </div>
                  <p className="text-slate-700 font-semibold text-lg text-center">Start a conversation</p>
                  <p className="text-slate-400 text-sm mt-1 text-center px-4">Ask me anything about the document!</p>
                </div>
              ) : (
                messages.map((msg, index) => (
                  <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    {msg.role === 'user' ? (
                      <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                        {user?.username?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center shrink-0">
                        <BotMessageSquare className="w-4 h-4 text-white" strokeWidth={2} />
                      </div>
                    )}
                    <div className={`max-w-[85%] sm:max-w-[70%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-indigo-500 text-white rounded-tr-sm'
                        : msg.isError
                        ? 'bg-red-50 text-red-600 border border-red-200 rounded-tl-sm'
                        : 'bg-white text-slate-700 border border-slate-200 rounded-tl-sm shadow-sm'
                    }`}>
                      {msg.role === 'assistant' ? (
                        <div className="prose prose-sm max-w-none text-slate-700 prose-strong:text-slate-900 prose-strong:font-semibold prose-ul:my-1 prose-li:my-0.5 prose-p:my-1 prose-p:leading-relaxed">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      ) : msg.content}
                    </div>
                  </div>
                ))
              )}
              {chatLoading && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center shrink-0">
                    <BotMessageSquare className="w-4 h-4 text-white" strokeWidth={2} />
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                    <div className="flex gap-1 items-center h-4">
                      <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="shrink-0 bg-white border-t border-slate-200 px-4 sm:px-6 py-4">
              <div className="flex items-center gap-2 sm:gap-3 bg-slate-50 border-2 border-slate-200 rounded-2xl px-3 sm:px-4 py-2 focus-within:border-indigo-400 focus-within:bg-white transition-all">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask a question..."
                  disabled={chatLoading}
                  className="flex-1 bg-transparent text-sm text-slate-800 placeholder-slate-400 outline-none disabled:opacity-50"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || chatLoading}
                  className="w-8 h-8 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center transition-colors shrink-0"
                >
                  <Send className="w-4 h-4" strokeWidth={2} />
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-2 text-center">
                Press <kbd className="px-1 py-0.5 bg-slate-100 rounded text-xs">Enter</kbd> to send
              </p>
            </div>
          </div>
        )}

        {/* AI Actions Tab */}
        {activeTab === 'ai-actions' && (
          <div className="h-full overflow-y-auto bg-white">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-indigo-500 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" strokeWidth={2} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">AI Assistant</h2>
                    <p className="text-sm text-slate-500">Powered by advanced AI</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-blue-600" strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Generate Summary</h3>
                    <p className="text-sm text-slate-500 mb-4">Get a concise summary of the entire document.</p>
                    <button onClick={handleGenerateSummary} disabled={summaryLoading}
                      className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      {summaryLoading ? (<><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Generating...</>) : 'Summarize'}
                    </button>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5 text-yellow-600" strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Explain a Concept</h3>
                    <p className="text-sm text-slate-500 mb-4">Enter a topic or concept from the document to get a detailed explanation.</p>
                    <input type="text" value={concept} onChange={(e) => setConcept(e.target.value)}
                      onKeyDown={handleExplainKeyDown} placeholder="e.g., 'React Hooks'" disabled={explainLoading}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent mb-4 disabled:opacity-50"
                    />
                    <button onClick={handleExplain} disabled={explainLoading || !concept.trim()}
                      className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      {explainLoading ? (<><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Explaining...</>) : 'Explain'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Flashcards Tab */}
        {activeTab === 'flashcards' && (
          <div className="h-full overflow-y-auto bg-white">
            {flashcardsLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
              </div>
            ) : (
              <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
                {flashcardSets.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24">
                    <div className="w-20 h-20 rounded-2xl bg-indigo-100 flex items-center justify-center mb-5">
                      <Brain className="w-10 h-10 text-indigo-500" strokeWidth={1.5} />
                    </div>
                    <p className="text-slate-800 font-bold text-xl mb-2">No Flashcards Yet</p>
                    <p className="text-slate-400 text-sm text-center max-w-xs mb-8">
                      Generate flashcards from your document to start learning and reinforce your knowledge.
                    </p>
                    <button
                      onClick={handleGenerateFlashcards}
                      disabled={generatingFlashcards}
                      className="flex items-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
                    >
                      {generatingFlashcards
                        ? (<><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Generating...</>)
                        : (<><Plus className="w-4 h-4" strokeWidth={2} />Generate Flashcards</>)
                      }
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-xl font-bold text-slate-900">Your Flashcard Sets</h2>
                        <p className="text-sm text-slate-500 mt-0.5">{flashcardSets.length} set{flashcardSets.length !== 1 ? 's' : ''} available</p>
                      </div>
                      <button
                        onClick={handleGenerateFlashcards}
                        disabled={generatingFlashcards}
                        className="flex items-center gap-2 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors text-sm"
                      >
                        {generatingFlashcards
                          ? (<><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Generating...</>)
                          : (<><Plus className="w-4 h-4" strokeWidth={2} />Generate New Set</>)
                        }
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {flashcardSets.map((set) => (
                        <div
                          key={set._id}
                          onClick={() => navigate(`/documents/${id}/flashcards?setId=${set._id}`)}
                          className="relative bg-white border-2 border-indigo-200 hover:border-indigo-400 rounded-2xl p-5 cursor-pointer transition-all hover:shadow-md group"
                        >
                          {/* ✅ FIXED: was quiz._id, now set._id and setDeleteSetId */}
                          <button
                            onClick={(e) => { e.stopPropagation(); setDeleteSetId(set._id); }}
                            className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-4 h-4" strokeWidth={2} />
                          </button>
                          <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center mb-4">
                            <Brain className="w-5 h-5 text-indigo-500" strokeWidth={2} />
                          </div>
                          <h3 className="font-semibold text-slate-900 mb-1">Flashcard Set</h3>
                          <p className="text-xs text-slate-400 uppercase tracking-wide mb-3">
                            Created {new Date(set.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
                          </p>
                          <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-semibold rounded-lg">
                            {set.cards?.length || 0} cards
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* Quizzes Tab */}
        {activeTab === 'quizzes' && (
          <div className="h-full overflow-y-auto bg-white">
            {quizzesLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
              </div>
            ) : (
              <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
                {quizzes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24">
                    <div className="w-20 h-20 rounded-2xl bg-indigo-100 flex items-center justify-center mb-5">
                      <BrainCircuit className="w-10 h-10 text-indigo-500" strokeWidth={1.5} />
                    </div>
                    <p className="text-slate-800 font-bold text-xl mb-2">No Quizzes Yet</p>
                    <p className="text-slate-400 text-sm text-center max-w-xs mb-8">
                      Generate a quiz from your document to test your knowledge.
                    </p>
                    <button
                      onClick={() => setShowQuizModal(true)}
                      className="flex items-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-xl transition-colors"
                    >
                      <Plus className="w-4 h-4" strokeWidth={2} />
                      Generate Quiz
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-xl font-bold text-slate-900">Your Quizzes</h2>
                        <p className="text-sm text-slate-500 mt-0.5">{quizzes.length} quiz{quizzes.length !== 1 ? 'zes' : ''} available</p>
                      </div>
                      <button
                        onClick={() => setShowQuizModal(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-xl transition-colors text-sm"
                      >
                        <Plus className="w-4 h-4" strokeWidth={2} />
                        Generate Quiz
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {quizzes.map((quiz) => {
                        const hasResults = !!quiz.completedAt;
                        return (
                          <div key={quiz._id} className="relative bg-white border-2 border-indigo-200 hover:border-indigo-400 rounded-2xl p-5 transition-all hover:shadow-md group">
                            {/* ✅ FIXED: was handleDeleteQuiz(quiz._id), now setDeleteQuizId(quiz._id) */}
                            <button
                              onClick={(e) => { e.stopPropagation(); setDeleteQuizId(quiz._id); }}
                              className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 className="w-4 h-4" strokeWidth={2} />
                            </button>
                            <div className="flex items-center gap-2 mb-3">
                              <span className="px-2.5 py-1 bg-indigo-50 text-indigo-600 text-xs font-semibold rounded-lg flex items-center gap-1">
                                <BrainCircuit className="w-3 h-3" strokeWidth={2} />
                                Score: {quiz.score ?? 0}
                              </span>
                            </div>
                            <h3 className="font-semibold text-slate-900 mb-1 pr-6 truncate">{quiz.title || `${document.title} - Quiz`}</h3>
                            <p className="text-xs text-slate-400 uppercase tracking-wide mb-3">
                              Created {new Date(quiz.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
                            </p>
                            <span className="inline-block px-3 py-1 bg-slate-50 text-slate-600 text-xs font-semibold rounded-lg mb-4">
                              {quiz.questions?.length || 0} Questions
                            </span>
                            <button
                              onClick={() => navigate(hasResults ? `/quizzes/${quiz._id}/results` : `/quizzes/${quiz._id}`)}
                              className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-50 hover:bg-indigo-500 text-indigo-600 hover:text-white font-semibold rounded-xl transition-colors text-sm"
                            >
                              {hasResults ? (
                                <><BarChart2 className="w-4 h-4" strokeWidth={2} />View Results</>
                              ) : (
                                <><Play className="w-4 h-4" strokeWidth={2} />Start Quiz</>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Summary Modal */}
      {summary && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900">Generated Summary</h2>
              <button onClick={() => setSummary('')} className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <div className="prose prose-sm max-w-none text-slate-700 prose-headings:text-slate-900 prose-headings:font-bold prose-p:text-slate-700 prose-p:leading-relaxed prose-p:mb-3 prose-strong:text-slate-900 prose-strong:font-semibold prose-ul:my-3 prose-ul:ml-4 prose-li:my-1.5">
                <ReactMarkdown>{summary}</ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Explanation Modal */}
      {explanation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900">Concept Explanation</h2>
              <button onClick={() => setExplanation('')} className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm font-medium text-yellow-900">Concept: <span className="font-semibold">{concept}</span></p>
              </div>
              <div className="prose prose-sm max-w-none text-slate-700 prose-headings:text-slate-900 prose-headings:font-bold prose-p:text-slate-700 prose-p:leading-relaxed prose-p:mb-3 prose-strong:text-slate-900 prose-strong:font-semibold prose-ul:my-3 prose-ul:ml-4 prose-li:my-1.5">
                <ReactMarkdown>{explanation}</ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Flashcard Set Modal */}
      {deleteSetId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">Delete Flashcard Set?</h2>
              <button onClick={() => setDeleteSetId(null)} className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <p className="text-sm text-slate-600 mb-6">
              Are you sure you want to delete this flashcard set? This action cannot be undone and all cards will be permanently removed.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button onClick={() => setDeleteSetId(null)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                Cancel
              </button>
              <button onClick={handleDeleteSet} disabled={deletingSet}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white text-sm font-semibold rounded-xl transition-colors">
                {deletingSet ? (<><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Deleting...</>) : 'Delete Set'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generate Quiz Modal */}
      {showQuizModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">Generate New Quiz</h2>
              <button onClick={() => setShowQuizModal(false)} className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Number of Questions</label>
            <input
              type="number" min={3} max={20}
              value={quizQuestionCount}
              onChange={(e) => setQuizQuestionCount(Number(e.target.value))}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-900 mb-6"
            />
            <div className="flex items-center justify-end gap-3">
              <button onClick={() => setShowQuizModal(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                Cancel
              </button>
              <button onClick={handleGenerateQuiz} disabled={generatingQuiz}
                className="px-5 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors">
                Generate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Quiz Modal */}
      {deleteQuizId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">Delete Quiz?</h2>
              <button onClick={() => setDeleteQuizId(null)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <p className="text-sm text-slate-600 mb-6">
              Are you sure you want to delete this quiz? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteQuizId(null)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl">
                Cancel
              </button>
              <button onClick={handleDeleteQuiz} disabled={deletingQuiz}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-xl flex items-center gap-2">
                {deletingQuiz ? (<><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Deleting...</>) : 'Delete Quiz'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentDetailPage;