import React, { useState, useEffect } from 'react';
import { Bot, Cpu, ShieldCheck, Activity, ArrowUpRight, Sparkles } from 'lucide-react';
import { formatINRCompact } from '../services/api';
import { useNavigate } from 'react-router-dom';

interface AgentStatusPanelProps {
  stats?: {
    status?: string;
    transactionsAnalyzed?: number;
    decisionsTotal?: number;
    actionsExecuted?: number;
    actionsBlocked?: number;
    escalations?: number;
    revenueRecovered?: number;
  };
}

export const AgentStatusPanel: React.FC<AgentStatusPanelProps> = ({ stats }) => {
  const navigate = useNavigate();
  const [pulseText, setPulseText] = useState('Autonomous Recovery Engine Running');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsProcessing(true);
      setPulseText('Analyzing TXN_' + Math.floor(1000 + Math.random() * 9000) + '...');
      setTimeout(() => {
        setIsProcessing(false);
        setPulseText('Autonomous Recovery Engine Running');
      }, 2500);
    }, 9000);
    return () => clearInterval(interval);
  }, []);

  const analyzed = stats?.transactionsAnalyzed ?? 10000;
  const decisions = stats?.decisionsTotal ?? 1627;
  const executed = stats?.actionsExecuted ?? 1446;
  const blocked = stats?.actionsBlocked ?? 64;
  const escalations = stats?.escalations ?? 117;
  const recovered = stats?.revenueRecovered ?? 591250;

  return (
    <div className="glass-card p-5 border-emerald-900/40 relative overflow-hidden flex flex-col justify-between">
      {/* Background ambient lighting */}
      <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

      <div>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                RecoverAI Agent
                <Sparkles className="w-3 h-3 text-emerald-400" />
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 pulse-emerald" />
                <span className="text-[11px] font-mono text-emerald-400 uppercase font-semibold">
                  {isProcessing ? 'PROCESSING' : 'ACTIVE'}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('/agent')}
            className="text-[11px] font-medium text-slate-400 hover:text-emerald-300 flex items-center gap-0.5 transition-colors"
          >
            Control Center <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>

        {/* Live processing status ticker */}
        <div className="mt-3.5 px-3 py-2 rounded-lg bg-background-surface/80 border border-background-border text-[11px] font-mono flex items-center justify-between text-slate-300">
          <div className="flex items-center gap-2 truncate">
            <Activity className={`w-3.5 h-3.5 ${isProcessing ? 'text-emerald-400 animate-spin' : 'text-slate-500'}`} />
            <span className="truncate">{pulseText}</span>
          </div>
          <span className="text-[10px] text-emerald-400/80 shrink-0 font-sans font-medium">
            Bounded Autonomy
          </span>
        </div>

        {/* Operational Metrics Grid */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          <div className="p-2.5 rounded-lg bg-background-secondary/60 border border-background-border">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
              Analyzed
            </span>
            <span className="text-sm font-bold font-mono text-slate-100 mt-0.5 block">
              {analyzed.toLocaleString()}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-background-secondary/60 border border-background-border">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
              Decisions
            </span>
            <span className="text-sm font-bold font-mono text-purple-300 mt-0.5 block">
              {decisions.toLocaleString()}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-background-secondary/60 border border-background-border">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
              Executed
            </span>
            <span className="text-sm font-bold font-mono text-emerald-400 mt-0.5 block">
              {executed.toLocaleString()}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-background-secondary/60 border border-background-border">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
              Actions Blocked
            </span>
            <span className="text-sm font-bold font-mono text-red-400 mt-0.5 block">
              {blocked.toLocaleString()}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-background-secondary/60 border border-background-border">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
              Escalations
            </span>
            <span className="text-sm font-bold font-mono text-amber-400 mt-0.5 block">
              {escalations.toLocaleString()}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-800/40">
            <span className="text-[10px] text-emerald-400 uppercase tracking-wider block font-semibold">
              Recovered
            </span>
            <span className="text-sm font-bold font-mono text-emerald-300 mt-0.5 block">
              {formatINRCompact(recovered)}
            </span>
          </div>
        </div>
      </div>

      {/* Safety Policy Guardrail Footer */}
      <div className="mt-4 pt-3 border-t border-background-border/80 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Policy Engine Guard: <strong className="text-slate-200">Enforced</strong></span>
        </div>
        <div className="flex items-center gap-1">
          <Cpu className="w-3.5 h-3.5 text-purple-400" />
          <span>Deterministic Fallback: <strong className="text-slate-200">Ready</strong></span>
        </div>
      </div>
    </div>
  );
};
