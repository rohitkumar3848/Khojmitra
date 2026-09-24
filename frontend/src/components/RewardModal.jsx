import React, { useState } from 'react';
import { rewardApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';
import { X, Gift, Heart, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

const PRESET_AMOUNTS = [50, 100, 200, 500];

export default function RewardModal({ isOpen, onClose, claim, onRewardSuccess }) {
  const { refreshUser } = useAuth();
  const [selectedAmount, setSelectedAmount] = useState(100);
  const [customAmount, setCustomAmount] = useState('');
  const [isZeroTip, setIsZeroTip] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen || !claim) return null;

  const effectiveTip = isZeroTip 
    ? 0 
    : (customAmount !== '' ? Number(customAmount) : selectedAmount);

  const finderShare = effectiveTip > 0 ? (effectiveTip * 0.5) : 0;
  const platformShare = effectiveTip > 0 ? (effectiveTip * 0.5) : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await rewardApi.submitReward({
        claimId: claim.id,
        tipAmount: effectiveTip
      });

      if (res.data.success) {
        setSuccess(true);
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
        await refreshUser();
        setTimeout(() => {
          onRewardSuccess();
          onClose();
        }, 2200);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Reward processing failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-slate-100 overflow-hidden relative">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-amber-100 hover:text-white p-1 rounded-full hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
              <Gift className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Reward the Finder</h2>
              <p className="text-xs text-amber-100">Express gratitude to {claim.finderName}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {success ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner animate-bounce">
                <Heart className="w-10 h-10 fill-emerald-600" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">Gratitude Sent!</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                Thank you for contributing to an honest community. Item handover has been marked closed!
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Amount options */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Select Reward Amount</label>
                <div className="grid grid-cols-4 gap-2">
                  {PRESET_AMOUNTS.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => {
                        setSelectedAmount(amt);
                        setCustomAmount('');
                        setIsZeroTip(false);
                      }}
                      className={`py-2 text-xs font-bold rounded-xl border transition ${
                        !isZeroTip && customAmount === '' && selectedAmount === amt
                          ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      ₹{amt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Amount input */}
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  placeholder="Or enter custom ₹ amount"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    setIsZeroTip(false);
                  }}
                  className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    setIsZeroTip(true);
                    setCustomAmount('');
                  }}
                  className={`px-3 py-2 text-xs font-bold rounded-xl border transition ${
                    isZeroTip
                      ? 'bg-slate-800 text-white border-slate-800'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Give ₹0 (Free)
                </button>
              </div>

              {/* Reward Split Breakdown Card */}
              <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl text-xs space-y-2">
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span>Total Tip:</span>
                  <span className="text-amber-700 text-sm">₹{effectiveTip}</span>
                </div>

                {effectiveTip > 0 ? (
                  <>
                    <div className="border-t border-amber-200 pt-2 flex items-center justify-between text-slate-600">
                      <span>👤 Honest Finder (50%):</span>
                      <span className="font-bold text-emerald-700">+₹{finderShare}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>🏛️ KhojMitra Fee (50%):</span>
                      <span className="font-semibold text-slate-700">₹{platformShare}</span>
                    </div>
                  </>
                ) : (
                  <div className="border-t border-amber-200 pt-2 text-[11px] text-amber-800 leading-relaxed flex items-start gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Platform Goodwill Clause:</strong> Since you gave ₹0, KhojMitra will automatically award <strong>10 Karma Points</strong> to {claim.finderName} to reward their honesty!
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold rounded-xl shadow-md transition disabled:opacity-50"
                >
                  {loading ? 'Processing...' : `Confirm & Close Handover`}
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
