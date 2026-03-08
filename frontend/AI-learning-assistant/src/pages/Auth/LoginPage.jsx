import React from 'react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';
import { BrainCircuit, Mail, Lock, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const LoginPage = () => {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { token, user } = await authService.login(email, password);
      login(user, token);
      toast.success('Logged in successfully!');
      navigate('/dashboard');
    } catch(err){
        setError(err.message || 'Failed to login. Please check your credentials.');
        toast.error(err.message || 'Failed to login.');
    } finally{
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-slate-200 via-white to-slate-200">
      <div className="absolute inset-0 opacity-30" />
      <div className="relative w-full max-w-md px-6">
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl shadow-xl shadow-slate-200/50 p-10">
          {/* Header */}
          <div className="text-center mb-10">
            <div className='inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-linear-to-br from-indigo-400 to-indigo-500 shadow-lg shadow-indigo-500/25 mb-6'>
              <BrainCircuit className="w-7 h-7 text-white" strokeWidth={2} />
            </div>
            <h1 className="text-2xl font-medium text-slate-900 tracking-tight mb-2">
              Welcome back
            </h1>
            <p className="text-slate-500 text-sm">
              Sign in to continue your journey
            </p>
          </div>
          {/* Form */}
          <div className="space-y-5">
            {/* Email Field */}
            <div className='space-y-2'>
              <label className='block text-xs font-semibold text-slate-700 uppercase tracking-wide'>
                Email
              </label>
              <div className='relative group'>
                <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200 ${focusedField === 'email' ? 'text-indigo-500' : 'text-slate-400'}`}>
                  <Mail className='h-5 w-5' strokeWidth={2}/>
                </div>
                <input
                  type='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  className='w-full h-12 pl-12 pr-4 border-2 border-slate-200 rounded-xl bg-slate-50/50 text-slate-900 placeholder-slate-400 text-sm font-medium transition-all duration-200 focus:outline-none focus:border-indigo-500 focus:bg-white focus:shadow-lg focus:shadow-indigo-500/10'
                  placeholder='you@example.com'
                />
              </div>
            </div>

            {/* Password field */}
            <div className='space-y-2'>
              <label className='block text-xs font-semibold text-slate-700 uppercase tracking-wide'>
                Password
              </label>
              <div className='relative group'>
                <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200 ${focusedField === 'password' ? 'text-indigo-500' : 'text-slate-400'}`}>
                  <Lock className='h-5 w-5' strokeWidth={2}/>
                </div>
                <input
                  type='password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  className='w-full h-12 pl-12 pr-4 border-2 border-slate-200 rounded-xl bg-slate-50/50 text-slate-900 placeholder-slate-400 text-sm font-medium transition-all duration-200 focus:outline-none focus:border-indigo-500 focus:bg-white focus:shadow-lg focus:shadow-indigo-500/10'
                  placeholder='Enter your password'
                />
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className='bg-red-50 border border-red-200 rounded-xl px-4 py-3'>
                <p className='text-red-600 text-sm font-medium'>{error}</p>
              </div>
            )}

            {/* Submit button */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className='relative w-full h-12 bg-linear-to-r from-indigo-500 to-indigo-500 hover:from-indigo-600 hover:to-indigo-600 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/25 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden cursor-pointer'
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin'/>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                  </>
                )}
              </span>
            </button>
          </div>

          {/* Footer */}
          <div className='mt-8 text-center'>
            <p className='text-slate-500 text-sm'>
              Don't have an account?{' '}
              <Link to='/register' className='text-indigo-600 font-semibold hover:text-indigo-700 transition-colors'>
                Sign Up
              </Link>
            </p>
          </div>
        </div>
        {/* Submit footer text */}
        <p className='text-center text-xs text-slate-400 mt-6'>
          By continuing, you agree to our Terms & Privacy Policy
        </p>
      </div>
    </div>
  );
}

export default LoginPage;