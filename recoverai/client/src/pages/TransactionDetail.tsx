import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Receipt,
  Bot,
  ShieldCheck,
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  User,
  CreditCard,
  Building,
  Sparkles,
  Check,
  X,
  ArrowRight,
} from 'lucide-react';
import { api, formatINR } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { RiskGauge } from '../components/RiskGauge';
import { Transaction, AgentDecision } from '../types';

export const TransactionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [decisionData, setDecisionData] = useState<{
    explanation?: string;
    aiUsed?: boolean;
    agentDecision?: AgentDecision;
  } | null>(null);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadTx() {
      if (!id) return;
      try {
        setLoading(true);
        const data = await api.getTransactionById(id);
        if (data) {
          setTransaction(data);
        }
      } catch (err) {
        console.warn('Failed to load transaction, generating fallback display:', err);
        // Default demo transaction if not seeded yet
        if (id === 'TXN_DEMO_001') {
          setTransaction({
            transactionId: 'TXN_DEMO_001',
            customerId: 'CUST_DEMO_001',
            customerName: 'Arjun Mehta',
            amount: 2499,
            currency: 'INR',
            timestamp: new Date().toISOString(),
            paymentMethod: 'UPI',
            status: 'RECOVERED',
            failureReason: 'BANK_TIMEOUT',
            failureCount: 0,
            customerHistory: 'EXCELLENT',
            riskScore: 18,
            riskLevel: 'LOW',
            recoveryProbability: 84,
            recommendedAction: 'RETRY',
            actualAction: 'RETRY',
            recoveryStatus: 'RECOVERED',
            recoveredAmount: 2499,
            policyResult: 'ALLOWED',
          });
        } else if (id === 'TXN_DEMO_002') {
          setTransaction({
            transactionId: 'TXN_DEMO_002',
            customerId: 'CUST_DEMO_002',
            customerName: 'Priya Singh',
            amount: 25000,
            currency: 'INR',
            timestamp: new Date().toISOString(),
            paymentMethod: 'CREDIT_CARD',
            status: 'ESCALATED',
            failureReason: 'CARD_DECLINED',
            failureCount: 5,
            customerHistory: 'POOR',
            riskScore: 86,
            riskLevel: 'HIGH',
            recoveryProbability: 12,
            recommendedAction: 'RETRY',
            actualAction: 'ESCALATE',
            recoveryStatus: 'ESCALATED',
            recoveredAmount: 0,
            policyResult: 'BLOCKED',
          });
        }
      } finally {
        setLoading(false);
      }
    }
    loadTx();
  }, [id]);

  const handleExecuteAction = async (action: string) => {
    if (!transaction) return;
    try {
      setExecuting(true);
      const res = await api.executeRecovery(transaction.transactionId, action);
      setActionSuccessMessage(
        res.recoveredAmount > 0
          ? `Successfully executed ${action}! ₹${res.recoveredAmount.toLocaleString('en-IN')} recovered.`
          : `Action ${action} executed. Status: ${res.finalStatus}`
      );
      // Refresh transaction
      const updated = await api.getTransactionById(transaction.transactionId);
      if (updated) setTransaction(updated);
    } catch (err) {
      console.error('Action execution failed:', err);
    } finally {
      setExecuting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400">
        <RotateCcw className="w-6 h-6 animate-spin mx-auto text-emerald-400 mb-2" />
        Loading transaction details...
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="glass-card p-12 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Transaction Not Found</h2>
        <p className="text-xs text-slate-400">
          No record exists for identifier: <span className="font-mono text-emerald-400">{id}</span>
        </p>
        <button onClick={() => navigate('/transactions')} className="btn-primary text-xs">
          Return to Registry
        </button>
      </div>
    );
  }

  const isRecovered = transaction.recoveryStatus === 'RECOVERED' || transaction.status === 'RECOVERED';
  const isBlocked = transaction.policyResult === 'BLOCKED' || transaction.status === 'BLOCKED';
  const isEscalated = transaction.recoveryStatus === 'ESCALATED' || transaction.status === 'ESCALATED';

  // Dynamic timeline construction
  const timeline = [
    {
      time: '10:31:02',
      title: 'Payment Initiated',
      desc: `Attempted ₹${transaction.amount.toLocaleString('en-IN')} via ${transaction.paymentMethod}`,
      status: 'COMPLETE',
    },
    {
      time: '10:31:04',
      title: 'Payment Failed',
      desc: `Failure code: ${transaction.failureReason}`,
      status: 'COMPLETE',
    },
    {
      time: '10:31:05',
      title: 'Failure Diagnosed',
      desc: 'RecoverAI analyzed root cause & customer context',
      status: 'COMPLETE',
    },
    {
      time: '10:31:05',
      title: 'Risk Score Calculated',
      desc: `Risk: ${transaction.riskScore}/100 (${transaction.riskLevel}) • ${transaction.recoveryProbability}% Probability`,
      status: 'COMPLETE',
    },
    {
      time: '10:31:06',
      title: 'Policy Validation',
      desc: transaction.policyResult === 'BLOCKED' ? 'Blocked: Policy constraint triggered' : 'Approved: All policy checks passed',
      status: transaction.policyResult === 'BLOCKED' ? 'BLOCKED' : 'COMPLETE',
    },
    {
      time: '10:31:07',
      title: transaction.recommendedAction === 'RETRY' ? 'Retry Executed' : 'Action Dispatched',
      desc: isBlocked ? 'Automatic retry prevented by policy engine' : 'Autonomous payment simulator retry dispatched',
      status: isBlocked ? 'BLOCKED' : isRecovered ? 'COMPLETE' : 'PROCESSING',
    },
    {
      time: '10:31:09',
      title: 'Payment Verified',
      desc: isRecovered ? 'Verified outcome: SUCCESS' : isBlocked ? 'Verification skipped due to policy block' : 'Awaiting confirmation',
      status: isBlocked ? 'SKIPPED' : isRecovered ? 'COMPLETE' : 'PENDING',
    },
    {
      time: '10:31:10',
      title: isRecovered ? `₹${transaction.amount.toLocaleString('en-IN')} Recovered` : 'Recovery Outcome Finalized',
      desc: isRecovered ? 'Reconciled to merchant ledger' : isEscalated ? 'Assigned to human finance queue' : 'Outcome recorded',
      status: isRecovered ? 'COMPLETE' : isEscalated ? 'ESCALATED' : isBlocked ? 'BLOCKED' : 'PENDING',
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Back Button & Navigation Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400">Environment:</span>
          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold">
            DEMO
          </span>
        </div>
      </div>

      {actionSuccessMessage && (
        <div className="p-4 rounded-xl bg-emerald-950/50 border border-emerald-500/60 text-emerald-300 text-xs font-semibold flex items-center justify-between">
          <span>{actionSuccessMessage}</span>
          <button onClick={() => setActionSuccessMessage(null)} className="text-slate-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Transaction Summary Top Card */}
      <div className="glass-card p-6 border-emerald-900/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="font-mono text-2xl sm:text-3xl font-extrabold text-white">
                {transaction.transactionId}
              </span>
              <StatusBadge status={transaction.status} size="lg" />
              {transaction.isDemo && (
                <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono text-[10px]">
                  BENCHMARK DEMO
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 font-mono">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" /> {transaction.customerName} ({transaction.customerId})
              </span>
              <span className="flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-slate-400" /> {transaction.paymentMethod}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" /> {new Date(transaction.timestamp).toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 border-t md:border-t-0 md:border-l border-background-border pt-4 md:pt-0 md:pl-6">
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 block">Amount</span>
              <span className="text-3xl font-bold font-mono text-white">
                {formatINR(transaction.amount)}
              </span>
            </div>

            <RiskGauge score={transaction.riskScore} size="md" />
          </div>
        </div>
      </div>

      {/* Two Column Layout: Visual Timeline vs AI Decision Card */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Visual Timeline (7 cols) */}
        <div className="lg:col-span-7 glass-card p-6 border-emerald-900/40">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center justify-between">
            <span>Autonomous Execution Timeline</span>
            <span className="text-[10px] font-mono text-emerald-400">8 Stage Trace</span>
          </h3>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-background-border">
            {timeline.map((item, idx) => {
              const isPassed = item.status === 'COMPLETE';
              const isItemBlocked = item.status === 'BLOCKED';
              const isItemEscalated = item.status === 'ESCALATED';

              return (
                <div key={idx} className="relative group">
                  {/* Timeline bullet */}
                  <div
                    className={`absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border-2 transition-all ${
                      isPassed
                        ? 'bg-emerald-500 border-emerald-400 shadow-glow-sm'
                        : isItemBlocked
                        ? 'bg-red-500 border-red-400'
                        : isItemEscalated
                        ? 'bg-amber-500 border-amber-400'
                        : 'bg-slate-800 border-slate-700'
                    }`}
                  />

                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-200">
                          {item.title}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          {item.time}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                    </div>

                    <StatusBadge status={item.status} size="sm" showDot={false} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Structured AI Decision Card (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-card p-6 border-emerald-900/40 space-y-5">
            <div className="flex items-center justify-between border-b border-background-border pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Bot className="w-4 h-4 text-purple-400" />
                AI Decision Engine
              </h3>
              <span className="text-[10px] font-mono text-purple-400">Bounded Engine</span>
            </div>

            <div>
              <span className="text-xs text-slate-400 block font-medium">Recommended Action</span>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-xl font-bold font-mono text-emerald-400">
                  {transaction.recommendedAction}
                </span>
                <StatusBadge status={transaction.recommendedAction} size="sm" />
              </div>
            </div>

            {/* Decision Factors Grid */}
            <div className="p-3.5 rounded-xl bg-background-surface border border-background-border text-xs space-y-2">
              <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-slate-400 block mb-1">
                Decision Factors
              </span>

              <div className="flex justify-between py-1 border-b border-background-border/50">
                <span className="text-slate-400">Failure Reason:</span>
                <span className="font-mono text-slate-200 font-semibold">{transaction.failureReason}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-background-border/50">
                <span className="text-slate-400">Previous Failures:</span>
                <span className="font-mono text-slate-200 font-semibold">{transaction.failureCount}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-background-border/50">
                <span className="text-slate-400">Customer History:</span>
                <span className="font-mono text-slate-200 font-semibold">{transaction.customerHistory}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-background-border/50">
                <span className="text-slate-400">Risk Score:</span>
                <span className="font-mono text-emerald-400 font-bold">{transaction.riskScore} / 100</span>
              </div>

              <div className="flex justify-between py-1 border-b border-background-border/50">
                <span className="text-slate-400">Recovery Probability:</span>
                <span className="font-mono text-emerald-400 font-bold">{transaction.recoveryProbability}%</span>
              </div>

              <div className="flex justify-between py-1">
                <span className="text-slate-400">Policy Engine Check:</span>
                <span className={`font-mono font-bold ${transaction.policyResult === 'BLOCKED' ? 'text-red-400' : 'text-emerald-400'}`}>
                  {transaction.policyResult || 'ALLOWED'}
                </span>
              </div>
            </div>

            {/* Business Reasoning */}
            <div className="p-3.5 rounded-xl bg-background-surface/80 border border-background-border text-xs leading-relaxed text-slate-300">
              <span className="font-semibold text-emerald-400 block mb-1">Business Rationale:</span>
              {transaction.failureReason === 'BANK_TIMEOUT' && (
                <p>Temporary bank timeout with low customer risk. Strong recovery probability (84%). Automated retry permitted by policy engine.</p>
              )}
              {transaction.failureReason === 'CARD_DECLINED' && transaction.riskScore > 70 && (
                <p>Card issuer declined with high risk score ({transaction.riskScore}) and multiple previous failures ({transaction.failureCount}). Automatic retry blocked by policy.</p>
              )}
              {transaction.failureReason !== 'BANK_TIMEOUT' && transaction.failureReason !== 'CARD_DECLINED' && (
                <p>Failure diagnosed as {transaction.failureReason}. Risk score: {transaction.riskScore}/100. Action selected based on recovery probability.</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-2 space-y-2">
              <button
                onClick={() => handleExecuteAction('RETRY')}
                disabled={executing || isRecovered || transaction.policyResult === 'BLOCKED'}
                className={`w-full py-2.5 text-xs font-bold uppercase rounded-lg transition-all flex items-center justify-center gap-2 ${
                  isRecovered || transaction.policyResult === 'BLOCKED'
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'btn-primary'
                }`}
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                {isRecovered ? 'Already Recovered' : transaction.policyResult === 'BLOCKED' ? 'Blocked by Policy' : 'Execute Recovery'}
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleExecuteAction('ESCALATE')}
                  disabled={executing}
                  className="btn-secondary text-xs py-2 justify-center"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  Escalate to Human
                </button>
                <button
                  onClick={() => handleExecuteAction('BLOCK')}
                  disabled={executing}
                  className="btn-secondary text-xs py-2 justify-center text-red-300 hover:text-red-200 hover:border-red-500"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                  Reject / Block
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
