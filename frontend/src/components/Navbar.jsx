import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { adminApi } from '../services/api';
import { 
  Shield, 
  Search, 
  PlusCircle, 
  Layers, 
  Award, 
  Wallet, 
  LogOut, 
  User as UserIcon, 
  Bell, 
  Lock,
  ChevronDown
} from 'lucide-react';

export default function Navbar({ onOpenAuth, onOpenPostModal, onSelectTab, activeTab }) {
  const { user, isAdmin, logout } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      adminApi.getPending()
        .then((res) => {
          if (res.data.success) {
            setPendingCount(res.data.data.length);
          }
        })
        .catch(() => {});
    }
  }, [isAdmin, activeTab]);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <div 
          onClick={() => onSelectTab('feed')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 transition">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight text-slate-900">KhojMitra</span>
              <span className="text-[10px] uppercase font-bold tracking-widest bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full">HQ & City</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-none">Smart Lost &amp; Found Portal</p>
          </div>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl">
          <button
            onClick={() => onSelectTab('feed')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'feed'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Explore Items
          </button>
          
          {user && (
            <button
              onClick={() => onSelectTab('my-activity')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'my-activity'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              My Claims &amp; Posts
            </button>
          )}

          {isAdmin && (
            <button
              onClick={() => onSelectTab('admin')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'admin'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-purple-700 hover:bg-purple-50'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Admin Desk</span>
              {pendingCount > 0 && (
                <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full animate-pulse">
                  {pendingCount}
                </span>
              )}
            </button>
          )}
        </nav>

        {/* Right Action buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (!user) {
                onOpenAuth();
              } else {
                onOpenPostModal();
              }
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-semibold rounded-xl shadow-xs hover:shadow transition transform active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Report Item</span>
          </button>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 p-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                  {user.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <div className="hidden sm:block text-left text-xs">
                  <p className="font-semibold text-slate-800 leading-tight truncate max-w-[100px]">{user.name}</p>
                  <p className="text-[10px] text-slate-500 font-medium">₹{user.walletBalance || 0} • {user.karmaPoints || 10} pts</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <div 
                  onMouseLeave={() => setShowDropdown(false)}
                  className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-fadeIn"
                >
                  <div className="px-4 py-2.5 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900">{user.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                    {user.department && (
                      <p className="text-[10px] text-emerald-700 font-medium mt-0.5">🏢 {user.department} • {user.officeLocation}</p>
                    )}
                  </div>

                  <div className="px-4 py-2 flex items-center justify-between text-xs bg-slate-50 mx-2 my-1 rounded-xl">
                    <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                      <Wallet className="w-4 h-4" />
                      <span>₹{user.walletBalance || 0}</span>
                    </div>
                    <div className="flex items-center gap-1 text-amber-600 font-semibold">
                      <Award className="w-4 h-4" />
                      <span>{user.karmaPoints || 0} Karma</span>
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => { onSelectTab('my-activity'); setShowDropdown(false); }}
                      className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Layers className="w-3.5 h-3.5 text-slate-400" />
                      <span>My Claims &amp; Posts</span>
                    </button>

                    {isAdmin && (
                      <button
                        onClick={() => { onSelectTab('admin'); setShowDropdown(false); }}
                        className="w-full text-left px-4 py-2 text-xs text-purple-700 hover:bg-purple-50 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <Lock className="w-3.5 h-3.5" />
                          <span>Admin Control Desk</span>
                        </div>
                        {pendingCount > 0 && (
                          <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                            {pendingCount}
                          </span>
                        )}
                      </button>
                    )}
                  </div>

                  <div className="border-t border-slate-100 pt-1">
                    <button
                      onClick={() => { logout(); setShowDropdown(false); }}
                      className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-emerald-700 border border-slate-200 hover:border-emerald-300 rounded-xl transition"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
