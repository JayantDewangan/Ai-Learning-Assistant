import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';
import toast from 'react-hot-toast';
import { User, Mail, Lock, Save } from 'lucide-react';

const ProfilePage = () => {
  const { user, login } = useAuth();

  const [profileForm, setProfileForm] = useState({ username: '', email: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({ username: user.username || '', email: user.email || '' });
    }
  }, [user]);

  const handleProfileSubmit = async () => {
    if (!profileForm.username.trim()) {
      toast.error('Username cannot be empty');
      return;
    }
    setProfileLoading(true);
    try {
      const response = await authService.updateProfile({ username: profileForm.username });
      const updatedUser = response?.data;
      if (updatedUser) {
        login(updatedUser, localStorage.getItem('token'));
      }
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error?.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    setPasswordLoading(true);
    try {
      await authService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success('Password changed successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error?.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Profile Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your account information and password</p>
      </div>

      {/* User Information Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-base font-semibold text-slate-800 mb-6">User Information</h2>

        <div className="space-y-5">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Username</label>
            <div className="flex items-center gap-3 px-4 py-3 border border-slate-300 rounded-xl focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all">
              <User className="w-4 h-4 text-slate-400 shrink-0" strokeWidth={2} />
              <input
                type="text"
                value={profileForm.username}
                onChange={(e) => setProfileForm(prev => ({ ...prev, username: e.target.value }))}
                placeholder="Enter your username"
                className="flex-1 bg-transparent text-sm text-slate-800 placeholder-slate-400 outline-none"
              />
            </div>
          </div>

          {/* Email — read only */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
            <div className="flex items-center gap-3 px-4 py-3 border border-slate-200 rounded-xl bg-slate-50">
              <Mail className="w-4 h-4 text-slate-400 shrink-0" strokeWidth={2} />
              <input
                type="email"
                value={profileForm.email}
                readOnly
                className="flex-1 bg-transparent text-sm text-slate-500 outline-none cursor-not-allowed"
              />
            </div>
            <p className="text-xs text-slate-400 mt-1.5">Email address cannot be changed</p>
          </div>

          {/* Save button */}
          <div className="flex justify-end pt-2">
            <button
              onClick={handleProfileSubmit}
              disabled={profileLoading}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer"
            >
              {profileLoading
                ? (<><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</>)
                : (<><Save className="w-4 h-4" strokeWidth={2} />Save Changes</>)
              }
            </button>
          </div>
        </div>
      </div>

      {/* Change Password Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-base font-semibold text-slate-800 mb-6">Change Password</h2>

        <div className="space-y-5">
          {/* Current Password */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Current Password</label>
            <div className="flex items-center gap-3 px-4 py-3 border border-slate-300 rounded-xl focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all">
              <Lock className="w-4 h-4 text-slate-400 shrink-0" strokeWidth={2} />
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                placeholder="Enter current password"
                className="flex-1 bg-transparent text-sm text-slate-800 placeholder-slate-400 outline-none"
              />
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">New Password</label>
            <div className="flex items-center gap-3 px-4 py-3 border border-slate-300 rounded-xl focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all">
              <Lock className="w-4 h-4 text-slate-400 shrink-0" strokeWidth={2} />
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                placeholder="Enter new password"
                className="flex-1 bg-transparent text-sm text-slate-800 placeholder-slate-400 outline-none"
              />
            </div>
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm New Password</label>
            <div className="flex items-center gap-3 px-4 py-3 border border-slate-300 rounded-xl focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all">
              <Lock className="w-4 h-4 text-slate-400 shrink-0" strokeWidth={2} />
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Confirm new password"
                className="flex-1 bg-transparent text-sm text-slate-800 placeholder-slate-400 outline-none"
              />
            </div>
          </div>

          {/* Change Password button */}
          <div className="flex justify-end pt-2">
            <button
              onClick={handlePasswordSubmit}
              disabled={passwordLoading}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer"
            >
              {passwordLoading
                ? (<><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Updating...</>)
                : (<><Lock className="w-4 h-4" strokeWidth={2} />Change Password</>)
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;