import React, { useState, useEffect, useRef } from 'react';
import { chatApi, claimApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  X, 
  Send, 
  ShieldCheck, 
  UserCheck, 
  Gift, 
  Building, 
  Clock, 
  AlertCircle,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

export default function ChatModal({ isOpen, onClose, claimId, onOpenReward }) {
  const { user, isAdmin } = useAuth();
  const [claim, setClaim] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState('');
  
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (claimId && isOpen) {
      loadData();
      const interval = setInterval(fetchMessages, 3000); // Polling every 3s for new messages
      return () => clearInterval(interval);
    }
  }, [claimId, isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [claimRes, msgRes] = await Promise.all([
        claimApi.getClaim(claimId),
        chatApi.getMessages(claimId)
      ]);
      if (claimRes.data.success) {
        setClaim(claimRes.data.data);
      }
      if (msgRes.data.success) {
        setMessages(msgRes.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load chat');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const msgRes = await chatApi.getMessages(claimId);
      if (msgRes.data.success) {
        setMessages(msgRes.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    setSending(true);
    try {
      const res = await chatApi.sendMessage(claimId, inputMsg);
      if (res.data.success) {
        setMessages(prev => [...prev, res.data.data]);
        setInputMsg('');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to send');
    } finally {
      setSending(false);
    }
  };

  const handleConfirmOwner = async () => {
    setConfirming(true);
    try {
      const res = await claimApi.confirmByFinder(claimId);
      if (res.data.success) {
        setClaim(res.data.data);
        await fetchMessages();
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to confirm owner');
    } finally {
      setConfirming(false);
    }
  };

  if (!isOpen) return null;

  const isFinder = user?.id === claim?.finderId;
  const isClaimant = user?.id === claim?.claimantId;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full h-[85vh] border border-slate-100 flex flex-col overflow-hidden relative">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-700 to-emerald-800 px-6 py-4 text-white flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold truncate max-w-md">
                Chat: {claim?.itemTitle || 'Lost & Found Coordination'}
              </h2>
              {claim?.status === 'FINDER_VERIFIED' && (
                <span className="bg-emerald-500/30 text-emerald-100 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Owner Confirmed</span>
                </span>
              )}
            </div>
            <p className="text-xs text-emerald-100 mt-0.5">
              Claimant: <span className="font-semibold">{claim?.claimantName}</span> • Finder: <span className="font-semibold">{claim?.finderName}</span> (Score: {claim?.score}/5)
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full text-emerald-100 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Banner for Finder / Claimant */}
        <div className="bg-slate-50 border-b border-slate-200/80 px-6 py-2.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Building className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium text-[11px]">
              Status: <span className="font-bold text-slate-800">{claim?.status}</span>
            </span>
          </div>

          {/* Finder Verification Action */}
          {isFinder && claim?.status === 'QUIZ_PASSED' && (
            <button
              onClick={handleConfirmOwner}
              disabled={confirming}
              className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>{confirming ? 'Confirming...' : 'Confirm as Rightful Owner'}</span>
            </button>
          )}

          {/* Claimant Tip / Reward Action */}
          {isClaimant && (claim?.status === 'FINDER_VERIFIED' || claim?.status === 'READY_FOR_PICKUP' || claim?.status === 'DELIVERED') && (
            <button
              onClick={() => onOpenReward(claim)}
              className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-bold rounded-xl shadow-xs transition animate-pulse"
            >
              <Gift className="w-3.5 h-3.5" />
              <span>Gratitude Reward &amp; Collect Item</span>
            </button>
          )}
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
          {error && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="text-center py-10 text-xs text-slate-400">Loading conversation history...</div>
          ) : messages.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-400">No messages yet. Send a message to get started!</div>
          ) : (
            messages.map((msg) => {
              if (msg.isSystemMessage) {
                return (
                  <div key={msg.id} className="flex justify-center my-2">
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-medium px-4 py-2 rounded-2xl max-w-md text-center shadow-xs flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{msg.content}</span>
                    </div>
                  </div>
                );
              }

              const isMe = msg.senderId === user?.id;

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <span className="text-[10px] text-slate-400 mb-0.5 px-1">
                    {msg.senderName}
                  </span>
                  <div
                    className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                      isMe
                        ? 'bg-emerald-600 text-white rounded-tr-none'
                        : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-none'
                    }`}
                  >
                    {msg.content}
                  </div>
                  <span className="text-[9px] text-slate-400 mt-0.5 px-1">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0">
          <input
            type="text"
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            placeholder="Type your message to coordinate pickup..."
            className="flex-1 px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-800"
          />
          <button
            type="submit"
            disabled={sending || !inputMsg.trim()}
            className="p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl shadow-sm transition disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
