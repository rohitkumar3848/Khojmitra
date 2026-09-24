import React, { useState } from 'react';
import { claimApi } from '../services/api';
import confetti from 'canvas-confetti';
import { X, ShieldCheck, HelpCircle, CheckCircle2, AlertTriangle, ArrowRight, MessageSquare } from 'lucide-react';

export default function ClaimQuizModal({ isOpen, onClose, item, onQuizPassed }) {
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  if (!isOpen || !item) return null;

  const questions = item.questions || [];

  const handleAnswerChange = (qId, value) => {
    setAnswers(prev => ({
      ...prev,
      [qId]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const answersPayload = questions.map(q => ({
        questionId: q.id,
        answer: answers[q.id] || ''
      }));

      const res = await claimApi.submitQuiz({
        itemId: item.id,
        answers: answersPayload
      });

      if (res.data.success) {
        const quizData = res.data.data;
        setResult(quizData);

        if (quizData.passed) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Quiz submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full border border-slate-100 overflow-hidden relative">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-700 to-emerald-800 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-emerald-100 hover:text-white p-1 rounded-full hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest bg-white/20 px-2 py-0.5 rounded-full">
                Ownership Verification
              </span>
              <h2 className="text-xl font-bold mt-1">Claim: {item.title}</h2>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* If already submitted and result available */}
          {result ? (
            <div className="text-center py-6 space-y-4">
              {result.passed ? (
                <>
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner animate-bounce">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900">Ownership Verified!</h3>
                    <p className="text-emerald-700 font-bold text-sm mt-1">
                      Score: {result.score} / {result.totalQuestions} Questions Correct
                    </p>
                    <p className="text-xs text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
                      You answered at least 3 out of 5 questions correctly! Direct private chat with the finder is now unlocked to coordinate your handover.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onQuizPassed(result.claimId);
                      onClose();
                    }}
                    className="mt-4 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 mx-auto shadow-md transition"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Open Live Chat with Finder</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <AlertTriangle className="w-10 h-10" />
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900">Verification Unsuccessful</h3>
                    <p className="text-rose-600 font-bold text-sm mt-1">
                      Score: {result.score} / {result.totalQuestions} Correct
                    </p>
                    <p className="text-xs text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
                      You need at least 3 correct answers out of 5 to claim this item. This threshold protects honest finders and true owners from unauthorized claims.
                    </p>
                  </div>
                  <button
                    onClick={() => setResult(null)}
                    className="mt-4 px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
                  >
                    Try Again
                  </button>
                </>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-3">
                <HelpCircle className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-600 leading-relaxed">
                  <span className="font-bold text-slate-800">5-Question Ownership Challenge: </span>
                  The finder has set 5 specific verification questions about this item. Please answer them as accurately as possible (at least 3 correct required).
                </div>
              </div>

              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Questions List */}
              <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                {questions.map((q, idx) => (
                  <div key={q.id} className="p-3.5 bg-slate-50/70 border border-slate-200/80 rounded-2xl space-y-1.5">
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-teal-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="text-xs font-bold text-slate-800 leading-snug">
                        {q.question}
                      </p>
                    </div>
                    <div className="pl-7">
                      <input
                        type="text"
                        required
                        value={answers[q.id] || ''}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                        placeholder="Type your answer here..."
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium text-slate-800"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">
                  Passing Score: 3 / 5
                </span>
                <div className="flex items-center gap-2">
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
                    className="px-6 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition disabled:opacity-50"
                  >
                    {loading ? 'Evaluating Answers...' : 'Submit Claim Quiz'}
                  </button>
                </div>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
