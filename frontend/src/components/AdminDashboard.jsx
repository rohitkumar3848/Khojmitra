import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/api';
import { 
  ShieldCheck, 
  Layers, 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Package, 
  Coins, 
  Trash2, 
  Building, 
  HelpCircle,
  AlertCircle
} from 'lucide-react';

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [pendingItems, setPendingItems] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending', 'users'
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [metricsRes, pendingRes, usersRes] = await Promise.all([
        adminApi.getMetrics(),
        adminApi.getPending(),
        adminApi.getUsers(),
      ]);

      if (metricsRes.data.success) setMetrics(metricsRes.data.data);
      if (pendingRes.data.success) setPendingItems(pendingRes.data.data);
      if (usersRes.data.success) setUsersList(usersRes.data.data);
    } catch (err) {
      setError('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (itemId) => {
    setActionLoading(itemId);
    try {
      const res = await adminApi.approveItem(itemId);
      if (res.data.success) {
        setSuccessMsg('Item approved and published to public feed!');
        setPendingItems(prev => prev.filter(i => i.id !== itemId));
        loadAll();
      }
    } catch (err) {
      setError('Failed to approve item');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (itemId) => {
    setActionLoading(itemId);
    try {
      const res = await adminApi.rejectItem(itemId);
      if (res.data.success) {
        setSuccessMsg('Item rejected');
        setPendingItems(prev => prev.filter(i => i.id !== itemId));
        loadAll();
      }
    } catch (err) {
      setError('Failed to reject item');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to remove this user?')) return;
    try {
      await adminApi.deleteUser(userId);
      setUsersList(prev => prev.filter(u => u.id !== userId));
      setSuccessMsg('User removed');
    } catch (err) {
      setError('Failed to delete user');
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-xs text-slate-400">Loading Admin Desk...</div>;
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Authority View
            </span>
            <span className="text-xs text-slate-400">• Security &amp; Helpdesk</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight mt-1">Admin Operations Center</h1>
          <p className="text-xs text-slate-300 mt-0.5">
            Moderate found items, verify 5-question authenticity, manage users, and review financial distributions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadAll}
            className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl transition"
          >
            Refresh Data
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center justify-between">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg('')} className="font-bold">×</button>
        </div>
      )}

      {/* KPI Cards */}
      {metrics && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Pending Review</span>
            <p className="text-2xl font-black text-amber-600 mt-1">{metrics.pendingApproval || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Total Items</span>
            <p className="text-2xl font-black text-slate-800 mt-1">{metrics.totalItems || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Returned Items</span>
            <p className="text-2xl font-black text-emerald-600 mt-1">{metrics.totalReturned || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Active Users</span>
            <p className="text-2xl font-black text-blue-600 mt-1">{metrics.totalUsers || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Platform Rev</span>
            <p className="text-2xl font-black text-teal-600 mt-1">₹{metrics.platformEarned || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Finder Rewards</span>
            <p className="text-2xl font-black text-purple-600 mt-1">₹{metrics.finderDistributed || 0}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'pending'
              ? 'bg-slate-900 text-white'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Pending Found Items ({pendingItems.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'users'
              ? 'bg-slate-900 text-white'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Registered Users ({usersList.length})</span>
        </button>
      </div>

      {/* Pending Items View */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          {pendingItems.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-2">
              <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">All Caught Up!</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                There are no pending found items waiting for moderation.
              </p>
            </div>
          ) : (
            pendingItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 flex flex-col lg:flex-row gap-6"
              >
                {/* Image */}
                <div className="w-full lg:w-48 h-40 bg-slate-100 rounded-2xl overflow-hidden shrink-0">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                      No Photo
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase bg-amber-100 text-amber-800">
                        {item.category} • Found Item
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 mt-1">{item.title}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleReject(item.id)}
                        disabled={actionLoading === item.id}
                        className="px-3 py-1.5 border border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                      <button
                        onClick={() => handleApprove(item.id)}
                        disabled={actionLoading === item.id}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>{actionLoading === item.id ? 'Processing...' : 'Approve & Publish'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Location & Drop desk */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-600">
                    <div className="p-2.5 bg-slate-50 rounded-xl">
                      <span className="font-bold text-slate-700 block mb-0.5">📍 Where Found:</span>
                      <span>
                        {item.location?.city} • {item.location?.officeBuilding} ({item.location?.floor})
                      </span>
                    </div>
                    <div className="p-2.5 bg-teal-50 text-teal-900 rounded-xl">
                      <span className="font-bold block mb-0.5">🏢 Central Drop Desk:</span>
                      <span>{item.centralDropLocation || 'Helpdesk'}</span>
                    </div>
                  </div>

                  {/* 5 Questions Admin Inspection */}
                  {item.verificationQuestions && item.verificationQuestions.length > 0 && (
                    <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl">
                      <span className="text-[11px] font-bold text-slate-700 block mb-2">
                        🔒 Configured 5 Verification Questions &amp; Secret Answers:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {item.verificationQuestions.map((q, idx) => (
                          <div key={idx} className="p-2 bg-white rounded-xl border border-slate-100 text-[11px]">
                            <p className="font-semibold text-slate-800">Q{idx + 1}: {q.question}</p>
                            <p className="text-emerald-700 font-medium mt-0.5">Ans: {q.expectedAnswer}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="text-[11px] text-slate-400">
                    Submitted by: <span className="font-semibold text-slate-700">{item.posterName}</span> ({item.posterEmail}) on {item.date}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Users List View */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-semibold uppercase">
                <tr>
                  <th className="px-6 py-3.5">User</th>
                  <th className="px-6 py-3.5">Department &amp; Office</th>
                  <th className="px-6 py-3.5">Roles</th>
                  <th className="px-6 py-3.5">Karma Points</th>
                  <th className="px-6 py-3.5">Wallet Balance</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-3.5">
                      <p className="font-bold text-slate-900">{u.name}</p>
                      <p className="text-slate-400 text-[11px]">{u.email}</p>
                    </td>
                    <td className="px-6 py-3.5 text-slate-600">
                      {u.department || 'General'} • {u.officeLocation || 'Main'}
                    </td>
                    <td className="px-6 py-3.5">
                      {u.roles?.map(r => (
                        <span key={r} className="inline-block mr-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-700">
                          {r}
                        </span>
                      ))}
                    </td>
                    <td className="px-6 py-3.5 font-bold text-amber-600">
                      {u.karmaPoints || 0} pts
                    </td>
                    <td className="px-6 py-3.5 font-bold text-emerald-700">
                      ₹{u.walletBalance || 0}
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
