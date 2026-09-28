import React, { useState } from 'react';
import { itemApi } from '../services/api';
import { X, Upload, ShieldCheck, MapPin, Building, HelpCircle, AlertCircle } from 'lucide-react';

const CATEGORIES = [
  'Electronics',
  'Wallets & Bags',
  'Keys',
  'Cards & IDs',
  'Accessories',
  'Documents',
  'Clothing & Bottles',
  'Other'
];

export default function PostItemModal({ isOpen, onClose, onItemCreated }) {
  const [type, setType] = useState('FOUND');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [imageUrl, setImageUrl] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Location
  const [city, setCity] = useState('Gurugram');
  const [locality, setLocality] = useState('Cyber Hub');
  const [officeBuilding, setOfficeBuilding] = useState('Tower B');
  const [floor, setFloor] = useState('4th Floor');
  const [roomOrDesk, setRoomOrDesk] = useState('');

  const [rewardNote, setRewardNote] = useState('');

  // Drop-off
  const [centralDropLocation, setCentralDropLocation] = useState('Tower B Ground Floor Reception Desk (Locker #14)');

  // Exactly 5 verification questions for Found items
  const [questions, setQuestions] = useState([
    { id: 1, question: 'What color is the cover / pouch / strap?', expectedAnswer: '' },
    { id: 2, question: 'Is there any sticker, initial, or unique mark?', expectedAnswer: '' },
    { id: 3, question: 'What wallpaper or lockscreen image is set (or brand)?', expectedAnswer: '' },
    { id: 4, question: 'Any specific scratch, dent, or distinctive damage?', expectedAnswer: '' },
    { id: 5, question: 'What is inside or attached to the item?', expectedAnswer: '' },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleQuestionChange = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (type === 'FOUND') {
      const emptyQ = questions.some(q => !q.question.trim() || !q.expectedAnswer.trim());
      if (emptyQ) {
        setError('Please fill out all 5 verification questions with their expected answers to protect property.');
        return;
      }
    }

    setLoading(true);
    try {
      const payload = {
        title,
        description,
        category,
        type,
        location: {
          city,
          locality,
          officeBuilding,
          floor,
          roomOrDesk
        },
        imageUrl,
        date,
        centralDropLocation: type === 'FOUND' ? centralDropLocation : null,
        rewardNote: type === 'LOST' ? rewardNote : null,
        verificationQuestions: type === 'FOUND' ? questions : null
      };

      const res = await itemApi.createItem(payload);
      if (res.data.success) {
        onItemCreated(res.data.data);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to submit post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full my-8 border border-slate-100 overflow-hidden relative">
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
              <Upload className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Report an Item</h2>
              <p className="text-xs text-emerald-100">Help the community locate and recover belongings</p>
            </div>
          </div>

          {/* Type Toggle */}
          <div className="grid grid-cols-2 gap-2 mt-5 bg-black/10 p-1.5 rounded-2xl">
            <button
              type="button"
              onClick={() => setType('FOUND')}
              className={`py-2 text-xs font-bold rounded-xl transition ${
                type === 'FOUND'
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'text-emerald-100 hover:text-white'
              }`}
            >
              🎉 I Found Something
            </button>
            <button
              type="button"
              onClick={() => setType('LOST')}
              className={`py-2 text-xs font-bold rounded-xl transition ${
                type === 'LOST'
                  ? 'bg-white text-rose-800 shadow-sm'
                  : 'text-emerald-100 hover:text-white'
              }`}
            >
              🔍 I Lost Something
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {type === 'FOUND' && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 flex items-start gap-2.5">
              <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Admin Verification Required</p>
                <p className="text-[11px] text-amber-700 mt-0.5">
                  To eliminate fraudulent entries, this found item will undergo quick Admin review before becoming visible on the live feed.
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Item Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Noise Wireless Earbuds, Fastrack Specs"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Description *</label>
            <textarea
              required
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe where and when it was found/lost, visible features, color..."
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Photo Image URL</label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://... or unsplash link"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Location details */}
          <div className="pt-2">
            <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>Location Details (Office &amp; City)</span>
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <input
                type="text"
                placeholder="City (e.g. Delhi, Gurugram)"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="px-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <input
                type="text"
                placeholder="Locality (e.g. Saket, Cyber Hub)"
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                className="px-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <input
                type="text"
                placeholder="Building (e.g. Tower B)"
                value={officeBuilding}
                onChange={(e) => setOfficeBuilding(e.target.value)}
                className="px-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <input
                type="text"
                placeholder="Floor / Zone (e.g. 4th Floor)"
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
                className="px-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Reward Offered note for Lost Items */}
          {type === 'LOST' && (
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <span className="text-amber-500">🎁</span>
                <span>Gratitude Reward Offered / Important Note (Optional)</span>
              </label>
              <input
                type="text"
                value={rewardNote}
                onChange={(e) => setRewardNote(e.target.value)}
                placeholder="e.g. ₹500 reward for finder, or Contains vital university/work documents"
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Offering a reward or noting urgency incentivizes the community to help return your item!
              </p>
            </div>
          )}

          {/* 5 Ownership Questions Builder for Found Items */}
          {type === 'FOUND' && (
            <div className="pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-teal-600" />
                  <span>5 Ownership Verification Questions</span>
                </h4>
                <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded-full">
                  Claimants must score 3/5
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mb-3">
                Expected answers will be hidden from the public. When a user claims this item, they must answer these questions correctly to unlock chat with you.
              </p>

              <div className="space-y-2.5">
                {questions.map((q, idx) => (
                  <div key={q.id} className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        required
                        value={q.question}
                        onChange={(e) => handleQuestionChange(idx, 'question', e.target.value)}
                        placeholder={`Question #${idx + 1}`}
                        className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium text-slate-800"
                      />
                    </div>
                    <div className="pl-7">
                      <input
                        type="text"
                        required
                        value={q.expectedAnswer}
                        onChange={(e) => handleQuestionChange(idx, 'expectedAnswer', e.target.value)}
                        placeholder="Expected secret answer (e.g. 'Blue', 'Batman sticker', '2 cards')"
                        className="w-full px-3 py-1.5 text-xs bg-white border border-emerald-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-emerald-900"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Central Drop Location */}
              <div className="mt-4 p-3 bg-teal-50 border border-teal-200 rounded-2xl">
                <label className="block text-xs font-bold text-teal-900 mb-1">
                  🏢 Central Custody / Drop-off Desk:
                </label>
                <input
                  type="text"
                  required
                  value={centralDropLocation}
                  onChange={(e) => setCentralDropLocation(e.target.value)}
                  placeholder="e.g. Tower B Ground Floor Reception Desk (Locker #14)"
                  className="w-full px-3 py-1.5 text-xs bg-white border border-teal-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
                <p className="text-[10px] text-teal-700 mt-1">
                  Please deposit the physical item at this central point after posting.
                </p>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
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
              className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold rounded-xl shadow-md transition disabled:opacity-50"
            >
              {loading ? 'Submitting...' : type === 'FOUND' ? 'Submit Found Item for Review' : 'Publish Lost Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
