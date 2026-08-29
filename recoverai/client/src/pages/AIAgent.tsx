import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Bot,
  Cpu,
  Activity,
  ShieldCheck,
  ShieldAlert,
  Send,
  Copy,
  Check,
  Sparkles,
  RefreshCw,
  Clock,
  Layers,
  ArrowRight,
  MessageSquare,
} from 'lucide-react';
import { api, formatINR, formatINRCompact } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { AgentDecision } from '../types';

export const AIAgent: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [agentStats, setAgentStats] = useState({
    status: 'ACTIVE',
    decisionsTotal: 1627,
    actionsExecuted: 1446,
    actionsBlocked: 64,
    escalations: 117,
    revenueRecovered: 591250,
    transactionsAnalyzed: 10000,
  });

  // Customer Communication Generator State
  const [custTxId, setCustTxId] = useState('TXN_DEMO_001');
  const [custAmount, setCustAmount] = useState('2499');
  const [generatedMessage, setGeneratedMessage] = useState(
    'Hi Arjun, your recent payment of ₹2,499 could not be completed due to a temporary bank timeout. You can safely retry your payment anytime using your preferred UPI app or card: https://pay.recoverai.demo/retry/TXN_DEMO_001'
  );
  const [copied, setCopied] = useState(false);
  const [simulatedSent, setSimulatedSent] = useState(false);

  // Live Stream Events
  const [events, setEvents] = useState([
    { time: '10:31:10', text: '₹2,499 verified and recovered for TXN_DEMO_001', type: 'recovered', id: 'e1' },
    { time: '10:31:08', text: 'Simulated payment gateway executed: SUCCESS', type: 'success', id: 'e2' },
    { time: '10:31:07', text: 'Policy check passed: Retry limit within bounds', type: 'policy', id: 'e3' },
    { time: '10:31:06', text: 'Risk Score: 18/100 (LOW) • Recovery Probability: 84%', type: 'risk', id: 'e4' },
    { time: '10:31:06', text: 'Failure diagnosed: BANK_TIMEOUT (temporary latency)', type: 'diag', id: 'e5' },
    { time: '10:31:05', text: 'Transaction TXN_DEMO_001 detected from webhook stream', type: 'detect', id: 'e6' },
  ]);

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const data = await api.getAgentStatus();
        if (data) setAgentStats(data);
      } catch (err) {
        console.warn('Using seeded agent stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const handleGenerateMessage = () => {
    setGeneratedMessage(
      `Dear Customer, your recent transaction of ₹${Number(custAmount).toLocaleString(
        'en-IN'
      )} (${custTxId}) was interrupted. RecoverAI has secured your payment session. Tap here to complete your checkout instantly: https://pay.recoverai.demo/retry/${custTxId}`
    );
    setSimulatedSent(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateSend = () => {
    setSimulatedSent(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            RecoverAI Autonomous Agent Control
            <Sparkles className="w-6 h-6 text-emerald-400" />
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Operations control console for autonomous reasoning, live event stream, and customer communication
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="px-3 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-xs font-mono text-emerald-300 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 pulse-emerald" />
            <span>Agent Status: ACTIVE & BOUNDED</span>
          </span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="glass-card p-4 border-emerald-900/40">
          <span className="text-[10px] font-mono uppercase text-slate-400 block">Analyzed</span>
          <span className="text-xl font-bold font-mono text-white mt-1 block">
            {agentStats.transactionsAnalyzed.toLocaleString()}
          </span>
        </div>

        <div className="glass-card p-4 border-purple-900/40">
          <span className="text-[10px] font-mono uppercase text-slate-400 block">Decisions Made</span>
          <span className="text-xl font-bold font-mono text-purple-300 mt-1 block">
            {agentStats.decisionsTotal.toLocaleString()}
          </span>
        </div>

        <div className="glass-card p-4 border-emerald-900/40">
          <span className="text-[10px] font-mono uppercase text-slate-400 block">Actions Executed</span>
          <span className="text-xl font-bold font-mono text-emerald-400 mt-1 block">
            {agentStats.actionsExecuted.toLocaleString()}
          </span>
        </div>

        <div className="glass-card p-4 border-red-900/40">
          <span className="text-[10px] font-mono uppercase text-slate-400 block">Actions Blocked</span>
          <span className="text-xl font-bold font-mono text-red-400 mt-1 block">
            {agentStats.actionsBlocked.toLocaleString()}
          </span>
        </div>

        <div className="glass-card p-4 border-amber-900/40">
          <span className="text-[10px] font-mono uppercase text-slate-400 block">Escalations</span>
          <span className="text-xl font-bold font-mono text-amber-400 mt-1 block">
            {agentStats.escalations.toLocaleString()}
          </span>
        </div>

        <div className="glass-card p-4 border-emerald-900/40 bg-emerald-950/20">
          <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold block">Recovered</span>
          <span className="text-xl font-bold font-mono text-emerald-300 mt-1 block">
            {formatINRCompact(agentStats.revenueRecovered)}
          </span>
        </div>
      </div>

      {/* Two Column Layout: Live Agent Event Stream & Customer Communication Generator */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Live Agent Event Stream (7 cols) */}
        <div className="lg:col-span-7 glass-card p-6 border-emerald-900/40 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-background-border pb-3 mb-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                Live Agent Telemetry Stream
              </h3>
              <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                STREAMING
              </span>
            </div>

            <div className="space-y-2.5 font-mono text-xs max-h-96 overflow-y-auto pr-1">
              {events.map((ev) => (
                <motion.div
                  key={ev.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`p-3 rounded-lg border transition-all flex items-start justify-between gap-3 ${
                    ev.type === 'recovered'
                      ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-300'
                      : ev.type === 'policy'
                      ? 'bg-cyan-950/20 border-cyan-800/40 text-cyan-300'
                      : ev.type === 'risk'
                      ? 'bg-amber-950/20 border-amber-800/40 text-amber-300'
                      : 'bg-background-surface/80 border-background-border text-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <span className="text-[10px] text-slate-500 font-bold shrink-0 mt-0.5">
                      {ev.time}
                    </span>
                    <span className="leading-snug">{ev.text}</span>
                  </div>
                  <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-background-card text-slate-400 border border-background-border shrink-0">
                    {ev.type}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-background-border flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Agent Architecture: ReAct + Deterministic Guard</span>
            <button
              onClick={() => navigate('/audit')}
              className="text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1"
            >
              Full Ledger <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Customer Communication Generator (5 cols) */}
        <div className="lg:col-span-5 glass-card p-6 border-emerald-900/40 space-y-5">
          <div className="flex items-center justify-between border-b border-background-border pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              Customer Recovery Messaging
            </h3>
            <span className="text-[10px] font-mono text-emerald-400">Safe Template</span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Generate bounded, safe payment recovery communications without exposing sensitive data.
          </p>

          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Transaction ID</label>
                <input
                  type="text"
                  value={custTxId}
                  onChange={(e) => setCustTxId(e.target.value)}
                  className="w-full bg-background-surface border border-background-border rounded-lg p-2 font-mono text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Amount (₹)</label>
                <input
                  type="number"
                  value={custAmount}
                  onChange={(e) => setCustAmount(e.target.value)}
                  className="w-full bg-background-surface border border-background-border rounded-lg p-2 font-mono text-white"
                />
              </div>
            </div>

            <button
              onClick={handleGenerateMessage}
              className="btn-secondary text-xs w-full justify-center py-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Generate Safe Recovery Message
            </button>

            {/* Generated Message Preview */}
            <div className="p-3.5 rounded-xl bg-background-surface border border-background-border space-y-2">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">
                Message Preview
              </span>
              <p className="text-slate-200 text-xs leading-relaxed font-mono bg-background-card p-3 rounded-lg border border-background-border/60">
                {generatedMessage}
              </p>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={handleCopy}
                  className="text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy Text'}
                </button>

                <button
                  onClick={handleSimulateSend}
                  disabled={simulatedSent}
                  className="btn-primary text-xs py-1.5 px-3"
                >
                  <Send className="w-3 h-3" />
                  {simulatedSent ? 'Simulated Sent ✓' : 'Simulate Send'}
                </button>
              </div>
            </div>

            {simulatedSent && (
              <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-[11px] font-mono text-emerald-300 text-center">
                ✓ Message dispatch simulated (No real SMS/Email sent)
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
