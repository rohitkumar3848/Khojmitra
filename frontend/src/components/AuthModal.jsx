import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Shield, Lock, Mail, User, Building, ArrowLeft, PlusCircle, CheckCircle } from 'lucide-react';

const GOOGLE_ACCOUNTS = [
  {
    name: 'Rohit Kumar',
    email: 'rohitkumar2003@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    googleId: '109876543210987654321',
  },
  {
    name: 'Rohit Sharma',
    email: 'rohit@company.com',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    googleId: '109876543210987654322',
  },
  {
    name: 'Priya Verma',
    email: 'priya@company.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    googleId: '109876543210987654323',
  },
  {
    name: 'Danielle Johnson',
    email: 'danielle.j@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    googleId: '109876543210987654324',
  },
];

export default function AuthModal({ isOpen, onClose }) {
  const { login, register, googleLogin } = useAuth();
  const [authMode, setAuthMode] = useState('google'); // Default to Google chooser as requested
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCustomGoogle, setShowCustomGoogle] = useState(false);

  // Form states for standard Auth
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [officeLocation, setOfficeLocation] = useState('');

  // Custom Google input
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');

  const googleBtnRef = useRef(null);

  useEffect(() => {
    // Try to render official Google Identity Services button if SDK is loaded and client ID provided
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (window.google && clientId && googleBtnRef.current) {
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response) => {
            if (response.credential) {
              setLoading(true);
              try {
                await googleLogin({ idToken: response.credential });
                onClose();
              } catch (err) {
                setError(err.response?.data?.message || err.message || 'Google Auth failed');
              } finally {
                setLoading(false);
              }
            }
          }
        });
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: 'outline',
          size: 'large',
          width: 320,
          text: 'continue_with'
        });
      } catch (e) {
        console.warn('Google GSI initialization skipped:', e);
      }
    }
  }, [authMode, isOpen]);

  if (!isOpen) return null;

  const handleSelectGoogleAccount = async (account) => {
    setError('');
    setLoading(true);
    try {
      await googleLogin({
        email: account.email,
        name: account.name,
        avatarUrl: account.avatar,
        googleId: account.googleId,
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Google login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomGoogleSubmit = async (e) => {
    e.preventDefault();
    if (!customEmail || !customEmail.trim()) {
      setError('Please enter your Google account email');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const gEmail = customEmail.trim().toLowerCase();
      const gName = (customName && customName.trim()) ? customName.trim() : gEmail.split('@')[0];
      await googleLogin({
        email: gEmail,
        name: gName,
        avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(gName)}`,
        googleId: `g_${Date.now()}`
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Google Sign-In failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (authMode === 'login') {
        await login(email, password);
      } else if (authMode === 'register') {
        await register({
          name,
          email,
          password,
          department,
          officeLocation,
          isAdmin: false,
        });
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail, demoPass) => {
    setError('');
    setLoading(true);
    try {
      await login(demoEmail, demoPass);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 relative">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 px-6 py-5 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-emerald-100 hover:text-white p-1 rounded-full hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">KhojMitra Portal</h2>
              <p className="text-xs text-emerald-100">Enterprise & City Lost-and-Found Network</p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex mt-4 bg-white/10 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => { setAuthMode('google'); setError(''); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
                authMode === 'google' ? 'bg-white text-emerald-800 shadow-sm' : 'text-emerald-100 hover:text-white'
              }`}
            >
              Sign in with Google
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('login'); setError(''); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
                authMode === 'login' ? 'bg-white text-emerald-800 shadow-sm' : 'text-emerald-100 hover:text-white'
              }`}
            >
              Email Sign In
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('register'); setError(''); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
                authMode === 'register' ? 'bg-white text-emerald-800 shadow-sm' : 'text-emerald-100 hover:text-white'
              }`}
            >
              Register
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* 1. GOOGLE SIGN-IN VIEW (Matching User Reference Image) */}
          {authMode === 'google' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Google Brand Header */}
              <div className="text-center pb-2 border-b border-slate-100">
                <div className="w-9 h-9 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto mb-2 shadow-xs">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">Choose an account</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  to continue to <span className="font-semibold text-emerald-700">KhojMitra</span>
                </p>
              </div>

              {/* Native Google One-Tap / GSI Container if Client ID is configured */}
              <div ref={googleBtnRef} className="flex justify-center empty:hidden" />

              {/* Account Chooser List (Exact layout of Google Account Chooser) */}
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                {GOOGLE_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.email}
                    type="button"
                    disabled={loading}
                    onClick={() => handleSelectGoogleAccount(acc)}
                    className="w-full px-4 py-3 bg-white hover:bg-slate-50 text-left flex items-center gap-3 transition group disabled:opacity-50"
                  >
                    <img
                      src={acc.avatar}
                      alt={acc.name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 group-hover:text-emerald-700 transition truncate">
                        {acc.name}
                      </p>
                      <p className="text-xs text-slate-500 truncate">{acc.email}</p>
                    </div>
                  </button>
                ))}

                {/* "Use another account" button */}
                <button
                  type="button"
                  onClick={() => setShowCustomGoogle(!showCustomGoogle)}
                  className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100 text-left flex items-center gap-3 transition text-slate-700"
                >
                  <div className="w-10 h-10 rounded-full bg-white border border-slate-300 flex items-center justify-center text-slate-500">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-700">Use another account</p>
                    <p className="text-[11px] text-slate-400">Sign in with your personal Google email</p>
                  </div>
                </button>
              </div>

              {/* Expandable Custom Google Email Input */}
              {showCustomGoogle && (
                <form onSubmit={handleCustomGoogleSubmit} className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-2xl space-y-3 animate-fadeIn">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Your Google Email *</label>
                    <input
                      type="email"
                      required
                      value={customEmail}
                      onChange={(e) => setCustomEmail(e.target.value)}
                      placeholder="e.g. rohitkumar@gmail.com"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Your Full Name</label>
                    <input
                      type="text"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder="Rohit Kumar"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition shadow-xs disabled:opacity-50"
                  >
                    {loading ? 'Connecting to Google...' : 'Continue with this Account'}
                  </button>
                </form>
              )}

              {/* Google Disclaimer Footer */}
              <p className="text-[11px] text-slate-400 text-center leading-relaxed px-2 pt-1">
                To continue, Google will share your name, email address, and profile picture with KhojMitra. Before using this app, you can review KhojMitra's privacy policy and terms of service.
              </p>
            </div>
          )}

          {/* 2. STANDARD EMAIL/PASSWORD LOGIN OR REGISTER */}
          {(authMode === 'login' || authMode === 'register') && (
            <form onSubmit={handleSubmit} className="space-y-3 animate-fadeIn">
              {authMode === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name *</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@company.com"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {authMode === 'register' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Department</label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="Engineering"
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Office / City</label>
                    <input
                      type="text"
                      value={officeLocation}
                      onChange={(e) => setOfficeLocation(e.target.value)}
                      placeholder="Tower B / Delhi"
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition shadow-xs disabled:opacity-50"
              >
                {loading ? 'Please wait...' : authMode === 'login' ? 'Sign In' : 'Register Account'}
              </button>

              {/* Quick Demo Logins */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
                <div className="relative flex justify-center text-[11px] uppercase"><span className="bg-white px-2 text-slate-400 font-medium">Or Quick Demo Login</span></div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('admin@khojmitra.com', 'admin123')}
                  className="py-1.5 px-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-medium transition flex flex-col items-center gap-0.5"
                >
                  <span>👑 Admin</span>
                  <span className="text-[10px] text-purple-500">Full Access</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('rohit@company.com', 'user123')}
                  className="py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-medium transition flex flex-col items-center gap-0.5"
                >
                  <span>👤 Finder</span>
                  <span className="text-[10px] text-emerald-500">Rohit</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('priya@company.com', 'user123')}
                  className="py-1.5 px-2 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-xl text-xs font-medium transition flex flex-col items-center gap-0.5"
                >
                  <span>📱 Claimant</span>
                  <span className="text-[10px] text-sky-500">Priya</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
