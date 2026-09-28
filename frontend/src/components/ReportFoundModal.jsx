import React, { useState } from 'react';
import { itemApi } from '../services/api';
import { X, CheckCircle, ShieldCheck, MapPin, Building, Gift, HelpCircle } from 'lucide-react';

export default function ReportFoundModal({ isOpen, item, onClose, onSuccess }) {
  const [centralDropLocation, setCentralDropLocation] = useState(
    'Tower B Ground Floor Reception Desk (Locker #14)'
  );
  const [foundNotes, setFoundNotes] = useState('');
  const [questions, setQuestions] = useState([
    { id: 1, question: 'What color or material is the main cover / strap / casing?', expectedAnswer: '' },
    { id: 2, question: 'Is there any sticker, engraved initial, or brand badge on it?', expectedAnswer: '' },
    { id: 3, question: 'Any specific scratch, dent, or distinctive physical mark?', expectedAnswer: '' },
    { id: 4, question: 'What key, accessory, or small item is attached or inside?', expectedAnswer: '' },
    { id: 5, question: 'What is the approximate size or distinguishing unique detail?', expectedAnswer: '' },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !item) return null;

  const handleQuestionChange = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const empty = questions.some(q => !q.question.trim() || !q.expectedAnswer.trim());
    if (empty) {
      setError('Please fill in all 5 verification questions with your expected answers so the genuine owner can verify.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        centralDropLocation,
        foundNotes,
        verificationQuestions: questions,
      };

      const res = await itemApi.reportFound(item.id, payload);
      if (res.data.success) {
        onSuccess(res.data.data);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to submit found report');
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
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">I Found This Lost Item!</h2>
              <p className="text-xs text-emerald-100">Set 5 verification questions so the owner can prove it's theirs</p>
            </div>
          </div>
        </div>

        {/* Item Preview Card */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-start gap-4">
            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-20 h-20 rounded-2xl object-cover border border-slate-200"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-slate-200 flex items-center justify-center text-slate-400 font-bold text-xs">
                No Photo
              </div>
            )}
            <div className="flex-1 min-w-0">
              <span className="px-2 py-0.5 rounded-lg text-[10px] font-extrabold uppercase bg-rose-100 text-rose-800">
                LOST ITEM
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-1">{item.title}</h3>
              <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{item.description}</p>
              {item.rewardNote && (
                <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 rounded-xl text-xs font-bold text-amber-800">
                  <Gift className="w-3.5 h-3.5 text-amber-600" />
                  <span>{item.rewardNote}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Drop-off Desk */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Building className="w-4 h-4 text-emerald-600" />
              <span>Central Drop-off Desk / Safe Location *</span>
            </label>
            <input
              type="text"
              required
              value={centralDropLocation}
              onChange={(e) => setCentralDropLocation(e.target.value)}
              placeholder="e.g. Tower B Ground Floor Reception Desk (Locker #14)"
              className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Where will the owner collect this item once they answer your questions?
            </p>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Finder's Note / Condition (Optional)
            </label>
            <input
              type="text"
              value={foundNotes}
              onChange={(e) => setFoundNotes(e.target.value)}
              placeholder="e.g. Found near escalator, battery was dead, kept safely."
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* 5 Questions */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-emerald-600" />
                <span>5 Ownership Verification Questions *</span>
              </h4>
              <span className="text-[11px] font-semibold text-emerald-600">Owner must score 3/5 to claim</span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              To ensure only the real owner recovers this item, specify 5 questions about hidden details only the genuine owner would know:
            </p>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {questions.map((q, idx) => (
                <div key={q.id} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>Question {idx + 1}</span>
                  </div>
                  <input
                    type="text"
                    required
                    value={q.question}
                    onChange={(e) => handleQuestionChange(idx, 'question', e.target.value)}
                    placeholder="Enter security question..."
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-0.5">
                      Expected Secret Answer (Hidden from owner):
                    </label>
                    <input
                      type="text"
                      required
                      value={q.expectedAnswer}
                      onChange={(e) => handleQuestionChange(idx, 'expectedAnswer', e.target.value)}
                      placeholder="Exact or keyword answer..."
                      className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
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
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow transition disabled:opacity-50 flex items-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{loading ? 'Submitting Report...' : 'Submit & Notify Owner'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
