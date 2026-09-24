import React, { useState, useEffect } from 'react';
import { claimApi, itemApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Layers, 
  MessageSquare, 
  Gift, 
  CheckCircle, 
  Clock, 
  ShieldCheck, 
  Building, 
  ArrowRight,
  ExternalLink
} from 'lucide-react';

export default function MyActivity({ onOpenChat, onOpenReward }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('claims'); // 'claims' or 'posts'
  const [myClaims, setMyClaims] = useState([]);
  const [finderClaims, setFinderClaims] = useState([]);
  const [myItems, setMyItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [claimsRes, finderRes, itemsRes] = await Promise.all([
        claimApi.getMyClaims(),
        claimApi.getFinderClaims(),
        itemApi.getMyItems(),
      ]);

      if (claimsRes.data.success) setMyClaims(claimsRes.data.data);
      if (finderRes.data.success) setFinderClaims(finderRes.data.data);
      if (itemsRes.data.success) setMyItems(itemsRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-xs text-slate-400">Loading your activity...</div>;
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">My Activity &amp; Claims</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track claims you initiated, items you found, and coordinate live handovers.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex bg-slate-100 p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab('claims')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'claims' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            My Claims ({myClaims.length})
          </button>
          <button
            onClick={() => setActiveTab('finder-claims')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'finder-claims' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Claims on My Items ({finderClaims.length})
          </button>
          <button
            onClick={() => setActiveTab('posts')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'posts' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            My Posts ({myItems.length})
          </button>
        </div>
      </div>

      {/* Tab: My Claims (Claimant View) */}
      {activeTab === 'claims' && (
        <div className="space-y-3">
          {myClaims.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-2">
              <Layers className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-700">No Claims Yet</h3>
              <p className="text-xs text-slate-400">
                You haven't claimed any found items yet. Browse the explore feed to see if someone found your lost article!
              </p>
            </div>
          ) : (
            myClaims.map((c) => (
              <div
                key={c.id}
                className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-slate-100 rounded-2xl overflow-hidden shrink-0">
                    {c.itemImageUrl ? (
                      <img src={c.itemImageUrl} alt={c.itemTitle} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">No img</div>
                    )}
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{c.itemTitle}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Finder: <span className="font-semibold text-slate-700">{c.finderName}</span> • Quiz Score:{' '}
                      <span className="text-emerald-700 font-bold">{c.score}/{c.totalQuestions}</span>
                    </p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-lg text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800">
                      {c.status}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => onOpenChat(c.id)}
                    className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center justify-center gap-1.5"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Open Chat</span>
                  </button>

                  {(c.status === 'FINDER_VERIFIED' || c.status === 'READY_FOR_PICKUP') && (
                    <button
                      onClick={() => onOpenReward(c)}
                      className="flex-1 sm:flex-none px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center justify-center gap-1.5"
                    >
                      <Gift className="w-4 h-4" />
                      <span>Reward Finder</span>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab: Finder Claims (Finder View) */}
      {activeTab === 'finder-claims' && (
        <div className="space-y-3">
          {finderClaims.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-2">
              <ShieldCheck className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-700">No Claims on Your Found Items</h3>
              <p className="text-xs text-slate-400">
                When someone answers your 5 verification questions and claims an item you found, it will appear here.
              </p>
            </div>
          ) : (
            finderClaims.map((c) => (
              <div
                key={c.id}
                className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{c.itemTitle}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Claimant: <span className="font-semibold text-slate-700">{c.claimantName}</span> ({c.claimantEmail}) • Score:{' '}
                    <span className="text-emerald-700 font-bold">{c.score}/{c.totalQuestions}</span>
                  </p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-lg text-[10px] font-extrabold uppercase bg-teal-100 text-teal-800">
                    {c.status}
                  </span>
                </div>

                <button
                  onClick={() => onOpenChat(c.id)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Verify in Chat</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab: My Posts */}
      {activeTab === 'posts' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {myItems.length === 0 ? (
            <div className="col-span-full bg-white p-12 rounded-3xl border border-slate-200 text-center text-xs text-slate-400">
              You haven't reported any lost or found items yet.
            </div>
          ) : (
            myItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold uppercase ${
                      item.type === 'FOUND' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {item.type}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500">{item.status}</span>
                  </div>

                  <h3 className="font-bold text-slate-800 text-sm">{item.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.description}</p>
                  <p className="text-[11px] text-slate-400 mt-2">
                    📍 {item.location?.city} • {item.location?.officeBuilding}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
