import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Shield, Lock, Mail, User, Building, Sparkles } from 'lucide-react';

export default function AuthModal({ isOpen, onClose }) {
  const { login, register, googleLogin } = useAuth();
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [officeLocation, setOfficeLocation] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLoginTab) {
        await login(email, password);
      } else {
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

  const handleGoogleSim = async () => {
    setError('');
    setLoading(true);
    try {
      await googleLogin({
        email: 'user.google@gmail.com',
        name: 'Google Verified User',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
        googleId: 'g_123456789'
      });
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 relative">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 px-6 py-6 text-white relative">
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

          {/* Tab Switcher */}
          <div className="flex mt-5 bg-white/10 p-1 rounded-xl">
            <button
              onClick={() => { setIsLoginTab(true); setError(''); }}
              className={`flex-1 py-1.5 text-sm font-semibold rounded-lg transition ${
                isLoginTab ? 'bg-white text-emerald-800 shadow-sm' : 'text-emerald-100 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsLoginTab(false); setError(''); }}
              className={`flex-1 py-1.5 text-sm font-semibold rounded-lg transition ${
                !isLoginTab ? 'bg-white text-emerald-800 shadow-sm' : 'text-emerald-100 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {!isLoginTab && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Password</label>
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

            {!isLoginTab && (
              <div className="grid grid-cols-2 gap-2">
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
              className="w-full mt-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition shadow-sm hover:shadow disabled:opacity-50"
            >
              {loading ? 'Please wait...' : isLoginTab ? 'Sign In to Portal' : 'Register Account'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-400 font-medium">Or Quick Demo Login</span></div>
          </div>

          {/* Quick Demo Logins for Pair Programming & Testing */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@khojmitra.com', 'admin123')}
              className="py-1.5 px-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-medium transition flex flex-col items-center gap-0.5"
            >
              <span>👑 Super Admin</span>
              <span className="text-[10px] text-purple-500">Full Access</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('rohit@company.com', 'user123')}
              className="py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-medium transition flex flex-col items-center gap-0.5"
            >
              <span>👤 Finder (Rohit)</span>
              <span className="text-[10px] text-emerald-500">Has Found Item</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('priya@company.com', 'user123')}
              className="py-1.5 px-2 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-xl text-xs font-medium transition flex flex-col items-center gap-0.5"
            >
              <span>📱 Claimant (Priya)</span>
              <span className="text-[10px] text-sky-500">Lost Item User</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleGoogleSim}
            className="w-full py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            Continue with Google Login
          </button>
        </div>
      </div>
    </div>
  );
}
