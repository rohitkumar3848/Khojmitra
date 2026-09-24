import React from 'react';
import { X, MapPin, Building, Calendar, ShieldCheck, HelpCircle, ArrowRight } from 'lucide-react';

export default function ItemDetailModal({ isOpen, onClose, item, onClaimClick, currentUserId }) {
  if (!isOpen || !item) return null;

  const isFound = item.type === 'FOUND';
  const isMyPost = item.userId === currentUserId;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full border border-slate-100 overflow-hidden relative">
        {/* Header */}
        <div className="relative h-56 bg-slate-100">
          {item.imageUrl ? (
            <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
              No Image Provided
            </div>
          )}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-slate-900/40 hover:bg-slate-900/60 text-white rounded-full backdrop-blur-md transition"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="absolute bottom-4 left-4 flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-xl text-xs font-black uppercase text-white ${
              isFound ? 'bg-emerald-600' : 'bg-rose-600'
            }`}>
              {item.type}
            </span>
            <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-white text-slate-800 shadow-sm">
              {item.category}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900">{item.title}</h2>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                {item.status}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed whitespace-pre-line">
              {item.description}
            </p>
          </div>

          {/* Location box */}
          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs space-y-2">
            <div className="flex items-center gap-2 text-slate-700">
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">
                {item.location?.city || 'City'}, {item.location?.locality || 'Locality'}
              </span>
            </div>
            {item.location?.officeBuilding && (
              <div className="flex items-center gap-2 text-slate-600 pl-6 text-[11px]">
                <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>
                  {item.location.officeBuilding} • {item.location.floor} ({item.location.roomOrDesk || 'Lobby/Common'})
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 text-slate-400 pl-6 text-[11px]">
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              <span>Reported on: {item.date}</span>
            </div>
          </div>

          {/* Central drop location */}
          {item.centralDropLocation && (
            <div className="p-3 bg-teal-50 border border-teal-200 text-teal-900 rounded-2xl text-xs flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Central Drop Custody Desk: </span>
                <span className="text-teal-800">{item.centralDropLocation}</span>
              </div>
            </div>
          )}

          {/* Action button */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 transition"
            >
              Close
            </button>

            {isFound && item.status === 'APPROVED' && !isMyPost && (
              <button
                onClick={() => {
                  onClose();
                  onClaimClick(item);
                }}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition"
              >
                <span>Take 5-Q Ownership Quiz</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
