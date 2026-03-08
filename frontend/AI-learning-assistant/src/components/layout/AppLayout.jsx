import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  BookOpen,
  User,
  LogOut,
  BrainCircuit,
  Bell,
  Menu,
  X,
  Clock,
} from 'lucide-react';
import progressService from '../../services/progressService';

const AppLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false); 
  const [recentActivity, setRecentActivity] = useState([]);  
  const [loadingActivity, setLoadingActivity] = useState(false);

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Documents', icon: FileText, path: '/documents' },
    { label: 'Flashcards', icon: BookOpen, path: '/flashcards' },
    { label: 'Profile', icon: User, path: '/profile' },
  ];


  //  Fetch recent activity when notification bell is clicked
  useEffect(() => {
    fetchRecentActivity(); // fetch on mount so dot shows immediately
}, []);

useEffect(() => {
    if (showNotifications) {
        fetchRecentActivity(); // refresh when opened
    }
}, [showNotifications]);

  const fetchRecentActivity = async () => {
    setLoadingActivity(true);
    try {
      const data = await progressService.getDashboardData();
      setRecentActivity(data?.data?.recentActivity?.documents || []);
    } catch (error) {
      console.error('Failed to load activity');
    } finally {
      setLoadingActivity(false);
    }
  };

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showNotifications && !event.target.closest('.notification-container')) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  return (
    <div className="flex h-screen bg-slate-50">

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-white border-r border-slate-200 
        flex flex-col shrink-0
        transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>

        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-500">
              <BrainCircuit className="w-5 h-5 text-white" strokeWidth={2} />
            </div>
            <span className="text-base font-bold text-slate-800 tracking-tight">
              AI Learning Assistant
            </span>
          </div>
          {/* Close button (mobile only) */}
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-2 hover:bg-slate-100 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5 text-slate-500 cursor-pointer" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-indigo-500 text-white shadow-sm shadow-indigo-500/30'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              <item.icon className="w-5 h-5 shrink-0" strokeWidth={2} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-slate-100">
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all duration-150 cursor-pointer"
          >
            <LogOut className="w-5 h-5 shrink-0" strokeWidth={2} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top bar */}
        <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-4 flex items-center justify-between gap-4 shrink-0">
          
          {/* Mobile menu button */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden p-2 hover:bg-slate-100 rounded-lg cursor-pointer"
          >
            <Menu className="w-6 h-6 text-slate-600" />
          </button>

          {/* Right side */}
          <div className="flex items-center gap-4 ml-auto">
            
            {/*  Notification Bell with Dropdown */}
            <div className="relative notification-container">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <Bell className="w-5 h-5 text-slate-500" strokeWidth={2} />
                {recentActivity.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full" />
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-lg border border-slate-200 z-50 flex flex-col" style={{ maxHeight: '360px' }}>
                  
                  {/* Header */}
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100">
                      <Clock className="w-4 h-4 text-slate-500" strokeWidth={2} />
                    </div>
                    <h3 className="font-semibold text-slate-800 text-sm">Recent Activity</h3>
                  </div>

                  {/* Content */}
                  <div className="overflow-y-auto flex-1">
                    {loadingActivity ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                      </div>
                    ) : recentActivity.length > 0 ? (
                      recentActivity.slice(0, 5).map((activity, index) => (
                        <div
                          key={index}
                          onClick={() => {
                            navigate(`/documents/${activity._id}`);
                            setShowNotifications(false);
                          }}
                          className="px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-100 shrink-0 mt-0.5">
                              <FileText className="w-4 h-4 text-indigo-600" strokeWidth={2} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-slate-700 font-medium truncate">
                                {activity.title}
                              </p>
                              <p className="text-xs text-slate-400 mt-0.5">
                                Accessed {new Date(activity.lastAccessed).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-8 text-center">
                        <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" strokeWidth={1.5} />
                        <p className="text-slate-500 text-sm font-medium">No recent activity</p>
                        <p className="text-slate-400 text-xs mt-1">Upload a document to get started</p>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  {recentActivity.length > 0 && (
                    <div className="border-t border-slate-100 px-4 py-2">
                      <button
                        onClick={() => {
                          navigate('/dashboard');
                          setShowNotifications(false);
                        }}
                        className="w-full text-center text-sm text-indigo-500 hover:text-indigo-700 font-medium py-1 transition-colors cursor-pointer"
                      >
                        View All Activity
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="hidden sm:flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-500 text-white text-sm font-bold">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-800">{user?.username || 'User'}</p>
                <p className="text-xs text-slate-500">{user?.email || ''}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
