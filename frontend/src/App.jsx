import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ItemCard from './components/ItemCard';
import AuthModal from './components/AuthModal';
import PostItemModal from './components/PostItemModal';
import ClaimQuizModal from './components/ClaimQuizModal';
import ChatModal from './components/ChatModal';
import RewardModal from './components/RewardModal';
import AdminDashboard from './components/AdminDashboard';
import MyActivity from './components/MyActivity';
import ItemDetailModal from './components/ItemDetailModal';
import { itemApi } from './services/api';
import { 
  Search, 
  Filter, 
  MapPin, 
  Building, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  CheckCircle,
  HelpCircle,
  ArrowRight
} from 'lucide-react';

const CATEGORIES = [
  'All Categories',
  'Electronics',
  'Wallets & Bags',
  'Keys',
  'Cards & IDs',
  'Accessories',
  'Documents',
  'Clothing & Bottles',
  'Other'
];

function MainContent() {
  const { user, isAdmin } = useAuth();

  // Navigation
  const [activeTab, setActiveTab] = useState('feed'); // 'feed', 'my-activity', 'admin'

  // Items & Filters
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterType, setFilterType] = useState(''); // '', 'LOST', 'FOUND'
  const [filterCategory, setFilterCategory] = useState('All Categories');
  const [filterCity, setFilterCity] = useState('');
  const [filterBuilding, setFilterBuilding] = useState('');

  // Modals state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [selectedItemForDetail, setSelectedItemForDetail] = useState(null);
  const [selectedItemForQuiz, setSelectedItemForQuiz] = useState(null);
  const [activeClaimIdForChat, setActiveClaimIdForChat] = useState(null);
  const [activeClaimForReward, setActiveClaimForReward] = useState(null);

  useEffect(() => {
    fetchFeed();
  }, [filterType, filterCategory, filterCity, filterBuilding]);

  const fetchFeed = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterType) params.type = filterType;
      if (filterCategory && filterCategory !== 'All Categories') params.category = filterCategory;
      if (filterCity) params.city = filterCity;
      if (filterBuilding) params.building = filterBuilding;

      const res = await itemApi.getFeed(params);
      if (res.data.success) {
        setItems(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch feed', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimClick = (item) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    // If claim is already active on this item and user is participant, open chat directly
    if (item.activeClaimId && (item.claimedByUserId === user.id || item.userId === user.id)) {
      setActiveClaimIdForChat(item.activeClaimId);
      return;
    }
    setSelectedItemForQuiz(item);
  };

  const handleQuizPassed = (claimId) => {
    setSelectedItemForQuiz(null);
    setActiveClaimIdForChat(claimId);
    fetchFeed();
  };

  const handleOpenRewardFromChat = (claim) => {
    setActiveClaimIdForChat(null);
    setActiveClaimForReward(claim);
  };

  const handleRewardSuccess = () => {
    fetchFeed();
  };

  // Client-side text filter on title & description
  const filteredItems = items.filter((item) => {
    if (!searchKeyword.trim()) return true;
    const term = searchKeyword.toLowerCase();
    const titleMatch = item.title?.toLowerCase().includes(term);
    const descMatch = item.description?.toLowerCase().includes(term);
    const cityMatch = item.location?.city?.toLowerCase().includes(term);
    const bldgMatch = item.location?.officeBuilding?.toLowerCase().includes(term);
    return titleMatch || descMatch || cityMatch || bldgMatch;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      <Navbar
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenPostModal={() => setPostModalOpen(true)}
        onSelectTab={setActiveTab}
        activeTab={activeTab}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* TAB 1: EXPLORE FEED */}
        {activeTab === 'feed' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Hero Banner */}
            <div className="relative rounded-3xl bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 p-8 sm:p-10 text-white overflow-hidden shadow-lg">
              <div className="relative z-10 max-w-2xl space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-semibold backdrop-blur-md">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Zero-Fraud Verification • 5-Question Challenge</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                  Lost something at office or in town? <br />
                  <span className="text-emerald-400">KhojMitra connects and recovers it.</span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  Enterprise lost &amp; found network with central custody desk drop-off, anti-fraud quiz verification, real-time chat, and an integrated gratitude reward split.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      if (!user) setAuthModalOpen(true);
                      else setPostModalOpen(true);
                    }}
                    className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-extrabold rounded-xl text-xs transition shadow-md flex items-center gap-2"
                  >
                    <span>+ Report Lost or Found Item</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>Live Central Custody Tracking</span>
                  </div>
                </div>
              </div>

              {/* Decorative background glow */}
              <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs space-y-3">
              <div className="flex flex-col md:flex-row items-center gap-3">
                {/* Search Box */}
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    placeholder="Search by item name, keyword, floor, building, or city..."
                    className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Type Filter Buttons */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-full md:w-auto shrink-0">
                  <button
                    onClick={() => setFilterType('')}
                    className={`flex-1 md:flex-none px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                      filterType === '' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    All Items
                  </button>
                  <button
                    onClick={() => setFilterType('FOUND')}
                    className={`flex-1 md:flex-none px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                      filterType === 'FOUND' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Found Items
                  </button>
                  <button
                    onClick={() => setFilterType('LOST')}
                    className={`flex-1 md:flex-none px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                      filterType === 'LOST' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Lost Items
                  </button>
                </div>
              </div>

              {/* Secondary Category and Location Selectors */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
                <span className="text-slate-400 font-semibold flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5" /> Filters:
                </span>

                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none"
                >
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="Filter City (e.g. Gurugram)"
                  value={filterCity}
                  onChange={(e) => setFilterCity(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs w-36 focus:outline-none"
                />

                <input
                  type="text"
                  placeholder="Office Building (e.g. Tower B)"
                  value={filterBuilding}
                  onChange={(e) => setFilterBuilding(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs w-36 focus:outline-none"
                />

                {(filterType || filterCategory !== 'All Categories' || filterCity || filterBuilding || searchKeyword) && (
                  <button
                    onClick={() => {
                      setFilterType('');
                      setFilterCategory('All Categories');
                      setFilterCity('');
                      setFilterBuilding('');
                      setSearchKeyword('');
                    }}
                    className="ml-auto text-xs text-rose-600 font-bold hover:underline"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            </div>

            {/* Items Grid */}
            {loading ? (
              <div className="text-center py-20 text-xs text-slate-400">Loading catalog...</div>
            ) : filteredItems.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
                <HelpCircle className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-700">No matching items found</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Try adjusting your search filters or be the first to report this missing or found article!
                </p>
                <button
                  onClick={() => setPostModalOpen(true)}
                  className="mt-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
                >
                  Report an Item Now
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filteredItems.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    onClaimClick={handleClaimClick}
                    onViewClick={setSelectedItemForDetail}
                    currentUserId={user?.id}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MY ACTIVITY */}
        {activeTab === 'my-activity' && (
          <MyActivity
            onOpenChat={(claimId) => setActiveClaimIdForChat(claimId)}
            onOpenReward={(claim) => setActiveClaimForReward(claim)}
          />
        )}

        {/* TAB 3: ADMIN DASHBOARD */}
        {activeTab === 'admin' && isAdmin && (
          <AdminDashboard />
        )}

      </main>

      {/* Modals */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      <PostItemModal
        isOpen={postModalOpen}
        onClose={() => setPostModalOpen(false)}
        onItemCreated={() => {
          fetchFeed();
          if (activeTab !== 'feed') setActiveTab('feed');
        }}
      />

      <ClaimQuizModal
        isOpen={!!selectedItemForQuiz}
        item={selectedItemForQuiz}
        onClose={() => setSelectedItemForQuiz(null)}
        onQuizPassed={handleQuizPassed}
      />

      <ChatModal
        isOpen={!!activeClaimIdForChat}
        claimId={activeClaimIdForChat}
        onClose={() => setActiveClaimIdForChat(null)}
        onOpenReward={handleOpenRewardFromChat}
      />

      <RewardModal
        isOpen={!!activeClaimForReward}
        claim={activeClaimForReward}
        onClose={() => setActiveClaimForReward(null)}
        onRewardSuccess={handleRewardSuccess}
      />

      <ItemDetailModal
        isOpen={!!selectedItemForDetail}
        item={selectedItemForDetail}
        onClose={() => setSelectedItemForDetail(null)}
        onClaimClick={handleClaimClick}
        currentUserId={user?.id}
      />

      {/* Footer */}
      <footer className="mt-16 bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        <p className="font-semibold text-slate-600">KhojMitra (खोज-मित्र) • Production Lost &amp; Found Platform</p>
        <p className="text-[11px] mt-1">Built with Spring Boot 3.3, Java 21, React 18, Tailwind CSS &amp; MongoDB</p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}
