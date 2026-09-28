import React from 'react';
import { 
  MapPin, 
  Calendar, 
  Building, 
  HelpCircle, 
  CheckCircle, 
  Clock, 
  ShieldCheck, 
  ArrowRight,
  Gift,
  Search
} from 'lucide-react';

export default function ItemCard({ item, onClaimClick, onViewClick, onReportFoundClick, currentUserId }) {
  const isFound = item.type === 'FOUND';
  const isMyPost = item.userId === currentUserId;
  const isReportedFoundBySomeone = item.type === 'LOST' && (item.foundByUserId || item.status === 'CLAIM_IN_PROGRESS');

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING_APPROVAL':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">Pending Review</span>;
      case 'APPROVED':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">Available</span>;
      case 'CLAIM_IN_PROGRESS':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">Verification Active</span>;
      case 'CONFIRMED_BY_FINDER':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">Finder Confirmed</span>;
      case 'READY_FOR_PICKUP':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">Ready at Central Desk</span>;
      case 'RETURNED':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">Returned &amp; Closed</span>;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition duration-200 overflow-hidden flex flex-col group">
      {/* Image container */}
      <div className="relative h-44 bg-slate-100 overflow-hidden">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-gradient-to-br from-slate-100 to-slate-200">
            <Building className="w-10 h-10 mb-1 opacity-50" />
            <span className="text-xs font-medium">No Photo Provided</span>
          </div>
        )}

        {/* Type Badge (LOST / FOUND) */}
        <div className="absolute top-3 left-3">
          <span
            className={`px-2.5 py-1 rounded-xl text-xs font-extrabold uppercase tracking-wider shadow-sm backdrop-blur-md ${
              isFound
                ? 'bg-emerald-600/90 text-white'
                : 'bg-rose-600/90 text-white'
            }`}
          >
            {item.type}
          </span>
        </div>

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          {getStatusBadge(item.status)}
        </div>

        {/* Category Pill */}
        <div className="absolute bottom-2.5 left-3">
          <span className="px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-white/90 text-slate-700 shadow-xs backdrop-blur-xs">
            {item.category}
          </span>
        </div>
      </div>

      {/* Body details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-slate-900 text-sm line-clamp-1 group-hover:text-emerald-700 transition">
            {item.title}
          </h3>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
            {item.description}
          </p>

          {/* Reward Offered note on Lost items */}
          {item.rewardNote && (
            <div className="mt-2.5 p-2 bg-amber-50/90 border border-amber-200 rounded-xl text-xs font-bold text-amber-800 flex items-center gap-1.5">
              <Gift className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="truncate">{item.rewardNote}</span>
            </div>
          )}

          {/* Lost item reported found notice */}
          {isReportedFoundBySomeone && (
            <div className="mt-2 p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-800 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Reported found! Owner can now answer 5 questions to verify.</span>
            </div>
          )}

          {/* Location & Office info */}
          <div className="mt-3 space-y-1.5 text-xs text-slate-600">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate">
                {item.location?.city ? `${item.location.city}${item.location.locality ? `, ${item.location.locality}` : ''}` : 'Location unlisted'}
              </span>
            </div>

            {item.location?.officeBuilding && (
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">
                  {item.location.officeBuilding} • {item.location.floor || ''} {item.location.roomOrDesk ? `(${item.location.roomOrDesk})` : ''}
                </span>
              </div>
            )}

            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              <span>{item.date || 'Recent'}</span>
              <span className="mx-1">•</span>
              <span>By {item.posterName || 'Community Member'}</span>
            </div>
          </div>

          {/* Central drop location notice for found items */}
          {item.centralDropLocation && (
            <div className="mt-3 p-2 bg-slate-50 border border-slate-100 rounded-xl text-[11px] text-slate-600 flex items-start gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
              <div className="leading-tight">
                <span className="font-semibold text-slate-700">Drop-off Desk: </span>
                <span className="text-slate-500">{item.centralDropLocation}</span>
              </div>
            </div>
          )}

          {/* 5 Questions Protection pill */}
          {(isFound || isReportedFoundBySomeone) && (
            <div className="mt-2 flex items-center gap-1 text-[11px] font-medium text-emerald-700">
              <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Protected by 5-Question Quiz</span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <button
            onClick={() => onViewClick(item)}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
          >
            Details
          </button>

          {/* CASE 1: Found Item -> Others can claim (cannot claim own post) */}
          {isFound && item.status === 'APPROVED' && !isMyPost && (
            <button
              onClick={() => onClaimClick(item)}
              className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition transform active:scale-95"
            >
              <span>Claim Item</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {/* CASE 2: Lost Item -> Others can click "I Found This!" */}
          {!isFound && !isReportedFoundBySomeone && !isMyPost && onReportFoundClick && (
            <button
              onClick={() => onReportFoundClick(item)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition transform active:scale-95"
            >
              <Search className="w-3.5 h-3.5" />
              <span>I Found This!</span>
            </button>
          )}

          {/* CASE 3: Lost Item reported found -> Owner can answer quiz to claim */}
          {!isFound && isReportedFoundBySomeone && isMyPost && (
            <button
              onClick={() => onClaimClick(item)}
              className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition animate-pulse"
            >
              <span>Verify &amp; Claim</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {/* CASE 4: Active Chat Session */}
          {(item.status === 'CLAIM_IN_PROGRESS' || item.status === 'CONFIRMED_BY_FINDER' || item.status === 'READY_FOR_PICKUP') && (
            <button
              onClick={() => onClaimClick(item)}
              className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
            >
              <span>Open Chat</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Badge if it's user's own post */}
          {isMyPost && !isReportedFoundBySomeone && (
            <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg">
              Your Post
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
