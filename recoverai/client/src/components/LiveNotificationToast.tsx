import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Mail, Copy, CheckCircle2, X, Sparkles, Phone, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';

interface LiveNotificationToastProps {
  onAutoFillCode?: (code: string) => void;
}

export const LiveNotificationToast: React.FC<LiveNotificationToastProps> = ({ onAutoFillCode }) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  useEffect(() => {
    let isMounted = true;
    const fetchLatest = async () => {
      try {
        const list = await api.getLiveNotifications();
        if (isMounted && list && list.length > 0) {
          setNotifications(list.slice(0, 3)); // show top 3 latest
        }
      } catch {
        // ignore
      }
    };

    fetchLatest();
    const interval = setInterval(fetchLatest, 3000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    if (onAutoFillCode) {
      onAutoFillCode(code);
    }
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDismiss = (id: string) => {
    setDismissedIds((prev) => [...prev, id]);
  };

  const visibleNotifications = notifications.filter((n) => !dismissedIds.includes(n.id));

  if (visibleNotifications.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm w-full space-y-2 pointer-events-none">
      <AnimatePresence>
        {visibleNotifications.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.9 }}
            className={`pointer-events-auto p-4 rounded-2xl border shadow-2xl backdrop-blur-xl transition-all ${
              item.channel === 'SMS'
                ? 'bg-slate-950/90 border-emerald-500/50 text-slate-100 shadow-emerald-950/40'
                : 'bg-slate-950/90 border-purple-500/50 text-slate-100 shadow-purple-950/40'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    item.channel === 'SMS'
                      ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/50'
                      : 'bg-purple-900/60 text-purple-300 border border-purple-700/50'
                  }`}
                >
                  {item.channel === 'SMS' ? <MessageSquare className="w-3.5 h-3.5" /> : <Mail className="w-3.5 h-3.5" />}
                </div>
                <div>
                  <span className="text-xs font-bold text-white block leading-tight">
                    {item.channel === 'SMS' ? 'Incoming SMS Message' : 'Incoming Corporate Email'}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 block leading-tight">
                    {item.carrierOrProvider}
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleDismiss(item.id)}
                className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Recipient info */}
            <div className="text-[11px] text-slate-300 mb-1.5 flex items-center justify-between font-mono">
              <span className="text-slate-400">To: <strong className="text-white">{item.maskedRecipient}</strong></span>
              <span className="text-[10px] text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800/40">
                DELIVERED
              </span>
            </div>

            {/* Message Body */}
            <div className="p-2.5 rounded-xl bg-background-surface/80 border border-background-border/60 text-xs text-slate-200 font-sans mb-3">
              {item.subject && (
                <div className="font-semibold text-purple-300 mb-1 text-[11px]">{item.subject}</div>
              )}
              <div className="text-[11px] text-slate-300 whitespace-pre-line leading-relaxed">
                {item.message}
              </div>
            </div>

            {/* Action Bar: Code Pill + Copy */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono text-slate-400">Code:</span>
                <span className="font-mono text-sm font-black text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-700/60 tracking-wider">
                  {item.otpCode}
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleCopy(item.otpCode, item.id)}
                className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5 text-[11px]"
              >
                {copiedId === item.id ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-emerald-300" />
                    <span>Auto-Filled!</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3 text-emerald-300" />
                    <span>Auto-Fill Code</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
