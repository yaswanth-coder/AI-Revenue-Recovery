import React, { useState } from 'react';
import { Bell, CheckCircle2, AlertTriangle, ShieldAlert, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NotificationItem {
  id: string;
  title: string;
  desc: string;
  time: string;
  type: 'recovered' | 'escalation' | 'blocked';
  transactionId?: string;
}

const SAMPLE_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    title: 'Revenue Recovery Completed',
    desc: '₹2,499 recovered from TXN_8231 via UPI retry verification.',
    time: '2m ago',
    type: 'recovered',
    transactionId: 'TXN_DEMO_001',
  },
  {
    id: 'n2',
    title: 'High-Risk Transaction Escalated',
    desc: 'TXN_8232 (₹25,000) requires human review. Risk score: 86.',
    time: '14m ago',
    type: 'escalation',
    transactionId: 'TXN_DEMO_002',
  },
  {
    id: 'n3',
    title: 'Policy Blocked Automatic Retry',
    desc: 'TXN_7190 exceeded 3 failure attempts limit.',
    time: '1h ago',
    type: 'blocked',
    transactionId: 'TXN_00120',
  },
  {
    id: 'n4',
    title: 'Revenue Recovery Completed',
    desc: '₹14,500 recovered from TXN_9044 after bank timeout resolution.',
    time: '2h ago',
    type: 'recovered',
    transactionId: 'TXN_00088',
  },
];

export const NotificationDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(SAMPLE_NOTIFICATIONS);
  const navigate = useNavigate();

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'recovered':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'escalation':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'blocked':
        return <ShieldAlert className="w-4 h-4 text-red-400" />;
    }
  };

  const getBorderColor = (type: NotificationItem['type']) => {
    switch (type) {
      case 'recovered':
        return 'border-l-emerald-500 bg-emerald-950/20';
      case 'escalation':
        return 'border-l-amber-500 bg-amber-950/20';
      case 'blocked':
        return 'border-l-red-500 bg-red-950/20';
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg bg-background-surface hover:bg-background-hover border border-background-border text-slate-300 hover:text-white transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-black font-bold text-[10px] rounded-full flex items-center justify-center animate-pulse">
            {notifications.length}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-84 sm:w-96 rounded-xl glass-card border border-emerald-900/40 shadow-2xl z-50 overflow-hidden">
            <div className="p-3 border-b border-background-border flex items-center justify-between bg-background-secondary/80">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Agent Notifications
                </span>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-300">
                  {notifications.length} LIVE
                </span>
              </div>
              <button
                onClick={() => setNotifications([])}
                className="text-[11px] text-slate-400 hover:text-slate-200"
              >
                Clear all
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-background-border/50">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  No active notifications. System operating normally.
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      setIsOpen(false);
                      if (n.transactionId) {
                        navigate(`/transactions/${n.transactionId}`);
                      }
                    }}
                    className={`p-3 border-l-2 cursor-pointer hover:bg-background-surface transition-colors ${getBorderColor(n.type)}`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5">{getIcon(n.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs font-semibold text-slate-200 truncate">
                            {n.title}
                          </p>
                          <span className="text-[10px] text-slate-400 font-mono shrink-0">
                            {n.time}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                          {n.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-2 border-t border-background-border bg-background-secondary/80 text-center">
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/audit');
                }}
                className="text-xs font-medium text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 py-1"
              >
                View full audit trail <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
