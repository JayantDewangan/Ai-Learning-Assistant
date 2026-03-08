import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import progressService from '../../services/progressService';
import toast from 'react-hot-toast';
import {
  FileText,
  BookOpen,
  BrainCircuit,
  Clock,
  ArrowRight,
} from 'lucide-react';

const DashboardPage = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const data = await progressService.getDashboardData();
      console.log('Dashboard API Response:', data);  // Debug
      setDashboardData(data?.data || data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      label: 'TOTAL DOCUMENTS',
      value: dashboardData?.overview?.totalDocuments ?? 0,
      icon: FileText,
      iconBg: 'bg-sky-500',
    },
    {
      label: 'FLASHCARD SETS',
      value: dashboardData?.overview?.totalFlashcardSets ?? 0,
      icon: BookOpen,
      iconBg: 'bg-pink-500',
    },
    {
      label: 'TOTAL QUIZZES',
      value: dashboardData?.overview?.totalQuizzes ?? 0,
      icon: BrainCircuit,
      iconBg: 'bg-indigo-500',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Track your learning progress and activity</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-2xl border border-slate-200 p-6 flex items-center justify-between shadow-sm"
          >
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                {card.label}
              </p>
              <p className="text-4xl font-bold text-slate-800">{card.value}</p>
            </div>
            <div className={`flex items-center justify-center w-14 h-14 rounded-2xl ${card.iconBg}`}>
              <card.icon className="w-7 h-7 text-white" strokeWidth={2} />
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100">
            <Clock className="w-4 h-4 text-slate-500" strokeWidth={2} />
          </div>
          <h2 className="text-base font-semibold text-slate-800">Recent Activity</h2>
        </div>

        <div className="divide-y divide-slate-100">
          {dashboardData?.recentActivity?.documents?.length > 0 ? (
            dashboardData.recentActivity.documents.map((activity, index) => (
              <div
                key={activity._id}
                className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                  <div>
                    <p className="text-sm text-slate-700">
                      <span className="font-semibold">Accessed Document:</span>{' '}
                      {activity.title}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {new Date(activity.lastAccessed).toLocaleString()}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/documents/${activity._id}`)}
                  className="text-s font-semibold text-indigo-500 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
                >
                  View
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            ))
          ) : (
            <div className="px-6 py-12 text-center">
              <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" strokeWidth={1.5} />
              <p className="text-slate-500 text-sm font-medium">No recent activity yet</p>
              <p className="text-slate-400 text-xs mt-1">Upload a document to get started</p>
              <button
                onClick={() => navigate('/documents')}
                className="mt-4 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm cursor-pointer font-semibold rounded-xl transition-colors"
              >
                Upload Document
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
