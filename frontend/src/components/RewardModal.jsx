import React, { useState } from 'react';
import { rewardApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';
import { 
  X, 
  Gift, 
  Heart, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  CreditCard, 
  Smartphone, 
  MapPin, 
  Building,
  SkipForward,
  ShieldCheck
} from 'lucide-react';

const PRESET_AMOUNTS = [50, 100, 200, 500];

export default function RewardModal({ isOpen, onClose, claim, onRewardSuccess }) {
  const { refreshUser } = useAuth();
  const [selectedAmount, setSelectedAmount] = useState(100);
  const [customAmount, setCustomAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi' | 'card' | 'wallet'
  const [isZeroTip, setIsZeroTip] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [completedHandover, setCompletedHandover] = useState(null);

  if (!isOpen || !claim) return null;

  const effectiveTip = isZeroTip 
    ? 0 
    : (customAmount !== '' ? Number(customAmount) : selectedAmount);

  const finderShare = effectiveTip > 0 ? (effectiveTip * 0.5) : 0;
  const platformShare = effectiveTip > 0 ? (effectiveTip * 0.5) : 0;

  const handleProcessReward = async (tipValue) => {
    setError('');
    setLoading(true);

    try {
      const res = await rewardApi.submitReward({
        claimId: claim.id,
        tipAmount: tipValue
      });

      if (res.data.success) {
        setCompletedHandover(res.data.data);
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        await refreshUser();
        onRewardSuccess();
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Reward processing failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full my-8 border border-slate-100 overflow-hidden relative">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-emerald-100 hover:text-white p-1 rounded-full hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
              <Gift className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Reward &amp; Final Collection</h2>
              <p className="text-xs text-emerald-100">Item confirmed by finder: {claim.finderName}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {completedHandover ? (
            /* SUCCESS & CENTRAL DESK COLLECTION PASS */
            <div className="space-y-4 animate-fadeIn">
              <div className="text-center py-2 space-y-2">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner animate-bounce">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-black text-slate-900">Item Collection Approved!</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {completedHandover.totalTip > 0
                    ? `Thank you for your ₹${completedHandover.totalTip} tip! 50% was transferred to finder's wallet.`
                    : 'Handover verified! 10 goodwill karma points were awarded to the honest finder.'}
                </p>
              </div>

              {/* Central Desk Collection Card */}
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs uppercase tracking-wider">
                  <Building className="w-4 h-4 text-emerald-700" />
                  <span>Central Collection Point</span>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-emerald-100 shadow-xs space-y-1">
                  <p className="text-xs font-bold text-slate-800">
                    📍 {claim.centralDeskLocation || 'Tower B Ground Floor Reception Desk (Locker #14)'}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Desk Operating Hours: <span className="font-semibold text-slate-700">9:00 AM - 6:00 PM (Mon-Sat)</span>
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Claim ID: <span className="font-mono font-bold text-emerald-700">{claim.id}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-emerald-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Show this Claim ID or verification code to the Security Executive at the desk to pick up your item.</span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
              >
                Close &amp; Go to My Items
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Explanation */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs text-slate-600 leading-relaxed">
                🎉 <strong>Verification Complete!</strong> {claim.finderName} confirmed you are the genuine owner of <strong>{claim.itemTitle}</strong>. You can show appreciation with a voluntary gratitude tip or skip directly to collect your item.
              </div>

              {/* Amount options */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Select Gratitude Reward</label>
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
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
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
                  className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Payment Method Selector if tip > 0 */}
              {effectiveTip > 0 && (
                <div className="space-y-2 pt-1">
                  <label className="block text-xs font-bold text-slate-700">Payment Method (Direct to Platform Account)</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('upi')}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                        paymentMethod === 'upi' ? 'border-emerald-500 bg-emerald-50/50 text-emerald-800' : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>UPI / GPay</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                        paymentMethod === 'card' ? 'border-emerald-500 bg-emerald-50/50 text-emerald-800' : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Card / NetBanking</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('wallet')}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                        paymentMethod === 'wallet' ? 'border-emerald-500 bg-emerald-50/50 text-emerald-800' : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      <Gift className="w-3.5 h-3.5" />
                      <span>Wallet</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Reward Split Breakdown Card */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-2">
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span>Tip Amount:</span>
                  <span className="text-emerald-700 text-sm">₹{effectiveTip}</span>
                </div>

                {effectiveTip > 0 ? (
                  <>
                    <div className="border-t border-slate-200 pt-2 flex items-center justify-between text-slate-600">
                      <span>👤 Finder Share (50%):</span>
                      <span className="font-bold text-emerald-700">+₹{finderShare}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>🏛️ KhojMitra Fee (50%):</span>
                      <span className="font-semibold text-slate-700">₹{platformShare}</span>
                    </div>
                  </>
                ) : (
                  <div className="border-t border-slate-200 pt-2 text-[11px] text-slate-600 leading-relaxed flex items-start gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span>
                      <strong>Goodwill Clause:</strong> If you choose ₹0 tip, KhojMitra will automatically grant <strong>10 Karma Points</strong> to {claim.finderName} to recognize their honesty.
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons: Pay vs Skip */}
              <div className="pt-2 space-y-2">
                {effectiveTip > 0 ? (
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleProcessReward(effectiveTip)}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <span>{loading ? 'Processing Payment...' : `Pay ₹${effectiveTip} & Get Collection Pass`}</span>
                  </button>
                ) : null}

                {/* Prominent Skip Button */}
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleProcessReward(0)}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5"
                >
                  <SkipForward className="w-3.5 h-3.5" />
                  <span>Skip Payment (Collect for Free)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
