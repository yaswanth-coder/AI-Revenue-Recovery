import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  IndianRupee,
  Clock,
  Lock,
  ShieldCheck,
  LogOut,
  Zap,
  Eye,
  XCircle,
  AlertTriangle,
  TrendingDown,
  Activity,
  Info,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { SecurityShieldModal } from '../components/SecurityShieldModal';

const PIE_COLORS = ['#10b981', '#f59e0b', '#ef4444'];

const RISK_LEVELS: Record<string, { label: string; color: string; bg: string; border: string }> = {
  LOW: { label: 'LOW', color: 'text-emerald-400', bg: 'bg-emerald-950/50', border: 'border-emerald-800/50' },
  MEDIUM: { label: 'MEDIUM', color: 'text-amber-400', bg: 'bg-amber-950/50', border: 'border-amber-800/50' },
  HIGH: { label: 'HIGH', color: 'text-red-400', bg: 'bg-red-950/50', border: 'border-red-800/50' },
};

const STATUS_CONFIG: Record<string, { color: string; bg: string; border: string }> = {
  RECOVERED: { color: 'text-emerald-300', bg: 'bg-emerald-950', border: 'border-emerald-800' },
  PENDING: { color: 'text-amber-300', bg: 'bg-amber-950', border: 'border-amber-800' },
  FAILED: { color: 'text-red-300', bg: 'bg-red-950', border: 'border-red-800' },
  ESCALATED: { color: 'text-purple-300', bg: 'bg-purple-950', border: 'border-purple-800' },
};

const DEMO_TRANSACTIONS = [
  { id: 'TXN_DEMO_001', customer: 'Raj Kumar', amount: 12450, reason: 'Insufficient Funds', risk: 'HIGH', riskScore: 84, status: 'RECOVERED', retries: 3, time: '2h ago', gateway: 'Razorpay' },
  { id: 'TXN_DEMO_002', customer: 'Priya Merchant', amount: 8200, reason: 'Card Expired', risk: 'MEDIUM', riskScore: 55, status: 'PENDING', retries: 1, time: '4h ago', gateway: 'Stripe' },
  { id: 'TXN_AF3829', customer: 'Ankit Shah', amount: 24990, reason: 'Bank Timeout', risk: 'LOW', riskScore: 22, status: 'FAILED', retries: 2, time: '6h ago', gateway: 'PayU' },
  { id: 'TXN_B83720', customer: 'Sunita Rao', amount: 3400, reason: 'Network Error', risk: 'LOW', riskScore: 18, status: 'RECOVERED', retries: 1, time: '8h ago', gateway: 'Cashfree' },
  { id: 'TXN_C92010', customer: 'Vikram Nair', amount: 49000, reason: 'Fraud Suspected', risk: 'HIGH', riskScore: 91, status: 'ESCALATED', retries: 0, time: '10h ago', gateway: 'Razorpay' },
  { id: 'TXN_D74612', customer: 'Meena Iyer', amount: 6750, reason: 'Insufficient Funds', risk: 'MEDIUM', riskScore: 62, status: 'PENDING', retries: 2, time: '12h ago', gateway: 'PhonePe' },
  { id: 'TXN_E55901', customer: 'Rahul Gupta', amount: 15800, reason: 'Card Declined', risk: 'HIGH', riskScore: 78, status: 'RECOVERED', retries: 4, time: '14h ago', gateway: 'Stripe' },
  { id: 'TXN_F10293', customer: 'Kavya Reddy', amount: 2100, reason: 'Network Error', risk: 'LOW', riskScore: 11, status: 'RECOVERED', retries: 1, time: '16h ago', gateway: 'PayU' },
];

const DEMO_RECOVERY_QUEUE = [
  { id: 'REC_001', txnId: 'TXN_DEMO_002', stage: 'Retry 1/3', nextAction: 'Smart Retry', scheduledAt: 'In 18 min', confidence: 72, agent: 'RecoverAI Agent' },
  { id: 'REC_002', txnId: 'TXN_D74612', stage: 'Retry 2/3', nextAction: 'Alternate Gateway', scheduledAt: 'In 32 min', confidence: 58, agent: 'RecoverAI Agent' },
  { id: 'REC_003', txnId: 'TXN_G20019', stage: 'Manual Review', nextAction: 'Awaiting Operator', scheduledAt: '—', confidence: 45, agent: 'Escalated' },
];

const TREND_DATA = [
  { day: 'Mon', recovered: 42, failed: 18, escalated: 3 },
  { day: 'Tue', recovered: 58, failed: 22, escalated: 5 },
  { day: 'Wed', recovered: 51, failed: 15, escalated: 2 },
  { day: 'Thu', recovered: 73, failed: 19, escalated: 4 },
  { day: 'Fri', recovered: 88, failed: 12, escalated: 6 },
  { day: 'Sat', recovered: 64, failed: 21, escalated: 3 },
  { day: 'Sun', recovered: 79, failed: 14, escalated: 2 },
];

type ActiveTab = 'overview' | 'transactions' | 'recovery' | 'risk' | 'analytics';

const tabs: { id: ActiveTab; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'transactions', label: 'Transactions', icon: Eye },
  { id: 'recovery', label: 'Recovery Queue', icon: RefreshCw },
  { id: 'risk', label: 'Risk Summary', icon: AlertTriangle },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp },
];

function ReadOnlyBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-[9px] font-mono font-black px-2 py-0.5 rounded bg-slate-800 border border-slate-600 text-slate-400 uppercase tracking-wider">
      <Eye className="w-2.5 h-2.5" /> READ ONLY
    </span>
  );
}

function OperatorOnlyOverlay({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-700/50 text-[10px] font-mono text-slate-500 cursor-not-allowed select-none">
      <Lock className="w-3 h-3 text-slate-600" />
      <span>{label} — Operator Only</span>
    </div>
  );
}

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [expandedTxn, setExpandedTxn] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [showSecurityModal, setShowSecurityModal] = useState(false);

  const filtered = filterStatus === 'ALL'
    ? DEMO_TRANSACTIONS
    : DEMO_TRANSACTIONS.filter((t) => t.status === filterStatus);

  const totalRecovered = DEMO_TRANSACTIONS.filter((t) => t.status === 'RECOVERED').length;
  const totalPending = DEMO_TRANSACTIONS.filter((t) => t.status === 'PENDING').length;
  const totalFailed = DEMO_TRANSACTIONS.filter((t) => t.status === 'FAILED').length;
  const totalEscalated = DEMO_TRANSACTIONS.filter((t) => t.status === 'ESCALATED').length;
  const amountRecovered = DEMO_TRANSACTIONS.filter((t) => t.status === 'RECOVERED').reduce((a, t) => a + t.amount, 0);

  const pieData = [
    { name: 'Recovered', value: totalRecovered },
    { name: 'Pending', value: totalPending },
    { name: 'Failed / Escalated', value: totalFailed + totalEscalated },
  ];

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);

  return (
    <div className="min-h-screen bg-background text-slate-100">
      {/* ── Top Bar ── */}
      <header className="h-16 bg-background-secondary/90 backdrop-blur-md border-b border-background-border px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center">
            <Zap className="w-5 h-5 fill-black text-black" />
          </div>
          <div>
            <span className="font-bold text-white text-sm">Recover<span className="text-emerald-400">AI</span></span>
            <span className="ml-2 text-[10px] bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 font-mono font-bold px-2 py-0.5 rounded">
              ADMIN VIEW — READ ONLY
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setShowSecurityModal(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-700/50 text-xs font-mono font-bold text-emerald-300 transition-colors shadow-glow-sm"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>WAF SECURED</span>
          </button>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-background-surface border border-background-border">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-emerald-600 to-emerald-400 text-black text-xs font-black flex items-center justify-center">
              {user?.name?.charAt(0) ?? 'A'}
            </div>
            <div className="hidden sm:block">
              <span className="text-xs font-semibold text-white block leading-tight">{user?.name}</span>
              <span className="text-[10px] font-mono text-emerald-400 leading-tight block">ADMIN</span>
            </div>
          </div>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/30 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Welcome */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">
              Welcome, <span className="text-emerald-400">{user?.name?.split(' ')[0]}</span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {user?.merchantName} · {user?.department} ·{' '}
              <span className="text-amber-400 font-mono font-semibold">View-Only Access</span>
            </p>
          </div>
          <div className="text-right text-[10px] font-mono text-slate-500">
            <div>Last refreshed: {new Date().toLocaleTimeString('en-IN')}</div>
            <div className="text-slate-600">Actions require Operator login</div>
          </div>
        </div>

        {/* KPI Summary Row */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            { label: 'Total Transactions', value: DEMO_TRANSACTIONS.length.toString(), icon: Activity, color: 'text-blue-400' },
            { label: 'Recovered', value: totalRecovered.toString(), icon: CheckCircle2, color: 'text-emerald-400' },
            { label: 'Pending Retry', value: totalPending.toString(), icon: Clock, color: 'text-amber-400' },
            { label: 'Failed', value: (totalFailed + totalEscalated).toString(), icon: XCircle, color: 'text-red-400' },
            { label: 'Amount Recovered', value: formatCurrency(amountRecovered), icon: IndianRupee, color: 'text-emerald-400' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="glass-card p-4 border border-background-border relative overflow-hidden">
              <div className="absolute top-2 right-2">
                <Icon className={`w-4 h-4 ${color} opacity-60`} />
              </div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wide mb-1">{label}</div>
              <div className={`text-lg font-black font-mono ${color}`}>{value}</div>
            </div>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 p-1 bg-background-surface border border-background-border rounded-xl overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-emerald-900/50 text-emerald-300 border border-emerald-700/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" /> {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">

          {/* ── OVERVIEW ── */}
          {activeTab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Trend Chart */}
              <div className="lg:col-span-2 glass-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" /> 7-Day Recovery Trend
                  </h3>
                  <ReadOnlyBadge />
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={TREND_DATA} barSize={16}>
                    <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, fontSize: 11 }} />
                    <Bar dataKey="recovered" fill="#10b981" name="Recovered" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="failed" fill="#ef4444" name="Failed" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="escalated" fill="#a855f7" name="Escalated" radius={[4, 4, 0, 0]} />
                    <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Pie Breakdown */}
              <div className="glass-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-white">Status Breakdown</h3>
                  <ReadOnlyBadge />
                </div>
                <ResponsiveContainer width="100%" height={150}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={42} outerRadius={68} paddingAngle={3} dataKey="value">
                      {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-2">
                  {pieData.map((d, i) => (
                    <div key={d.name} className="flex justify-between text-xs">
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <span className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[i] }} />
                        {d.name}
                      </span>
                      <span className="font-mono font-bold text-white">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Operator actions panel — visible but locked */}
              <div className="lg:col-span-3 glass-card p-5 border border-slate-700/30">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                  <Lock className="w-4 h-4 text-slate-500" /> Operator Actions (Visible — Locked for Admin)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <OperatorOnlyOverlay label="Trigger Recovery" />
                  <OperatorOnlyOverlay label="Block Transaction" />
                  <OperatorOnlyOverlay label="Approve AI Decision" />
                  <OperatorOnlyOverlay label="Edit Policy Rules" />
                  <OperatorOnlyOverlay label="Run Simulator" />
                  <OperatorOnlyOverlay label="Retry Payment" />
                  <OperatorOnlyOverlay label="Set Risk Threshold" />
                  <OperatorOnlyOverlay label="Export Audit Logs" />
                </div>
                <p className="text-[10px] text-slate-600 font-mono mt-3 text-center">
                  To perform any of the above, login as Operator at /login
                </p>
              </div>
            </motion.div>
          )}

          {/* ── TRANSACTIONS ── */}
          {activeTab === 'transactions' && (
            <motion.div key="transactions" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              {/* Filters — visible but read-only label */}
              <div className="glass-card p-4 flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-semibold">Filter by Status:</span>
                  {['ALL', 'RECOVERED', 'PENDING', 'FAILED', 'ESCALATED'].map((s) => (
                    <button
                      key={s}
                      onClick={() => setFilterStatus(s)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold border transition-colors ${
                        filterStatus === s
                          ? 'bg-emerald-900/60 border-emerald-600 text-emerald-300'
                          : 'bg-background-surface border-background-border text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <ReadOnlyBadge />
              </div>

              {/* Transaction Table */}
              <div className="glass-card p-0 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-background-border bg-background-surface/50">
                        <th className="px-4 py-3 text-left text-[10px] font-mono text-slate-400 uppercase tracking-wider">TXN ID</th>
                        <th className="px-4 py-3 text-left text-[10px] font-mono text-slate-400 uppercase tracking-wider">Customer</th>
                        <th className="px-4 py-3 text-left text-[10px] font-mono text-slate-400 uppercase tracking-wider">Amount</th>
                        <th className="px-4 py-3 text-left text-[10px] font-mono text-slate-400 uppercase tracking-wider">Failure Reason</th>
                        <th className="px-4 py-3 text-left text-[10px] font-mono text-slate-400 uppercase tracking-wider">Risk</th>
                        <th className="px-4 py-3 text-left text-[10px] font-mono text-slate-400 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-left text-[10px] font-mono text-slate-400 uppercase tracking-wider">Retries</th>
                        <th className="px-4 py-3 text-left text-[10px] font-mono text-slate-400 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-background-border/50">
                      {filtered.map((tx) => {
                        const risk = RISK_LEVELS[tx.risk];
                        const status = STATUS_CONFIG[tx.status];
                        const isExpanded = expandedTxn === tx.id;
                        return (
                          <React.Fragment key={tx.id}>
                            <tr
                              className="hover:bg-background-surface/40 transition-colors cursor-pointer"
                              onClick={() => setExpandedTxn(isExpanded ? null : tx.id)}
                            >
                              <td className="px-4 py-3 font-mono text-emerald-400 font-semibold">{tx.id}</td>
                              <td className="px-4 py-3 text-slate-200">{tx.customer}</td>
                              <td className="px-4 py-3 font-mono font-bold text-white">₹{tx.amount.toLocaleString()}</td>
                              <td className="px-4 py-3 text-slate-400">{tx.reason}</td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${risk.bg} ${risk.border} ${risk.color}`}>
                                  {risk.label} · {tx.riskScore}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${status.bg} ${status.border} ${status.color}`}>
                                  {tx.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 font-mono text-slate-400">{tx.retries}x</td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-1.5">
                                  <button
                                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 transition-colors"
                                    title="Expand details"
                                  >
                                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                  </button>
                                  {/* Action buttons visible but locked */}
                                  <span className="flex items-center gap-1 px-2 py-1 rounded bg-slate-900 border border-slate-700 text-[9px] font-mono text-slate-600 cursor-not-allowed">
                                    <Lock className="w-2.5 h-2.5" /> Retry
                                  </span>
                                  <span className="flex items-center gap-1 px-2 py-1 rounded bg-slate-900 border border-slate-700 text-[9px] font-mono text-slate-600 cursor-not-allowed">
                                    <Lock className="w-2.5 h-2.5" /> Block
                                  </span>
                                </div>
                              </td>
                            </tr>
                            {/* Expanded Detail Row */}
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.tr
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                >
                                  <td colSpan={8} className="px-4 pb-4 bg-background-surface/30">
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
                                      {[
                                        { label: 'Transaction ID', value: tx.id },
                                        { label: 'Customer', value: tx.customer },
                                        { label: 'Amount', value: `₹${tx.amount.toLocaleString()}` },
                                        { label: 'Gateway', value: tx.gateway },
                                        { label: 'Failure Reason', value: tx.reason },
                                        { label: 'Risk Score', value: `${tx.riskScore}/100 (${tx.risk})` },
                                        { label: 'Recovery Status', value: tx.status },
                                        { label: 'Retry Count', value: `${tx.retries} attempts` },
                                      ].map(({ label, value }) => (
                                        <div key={label} className="p-2 rounded-lg bg-background-card border border-background-border">
                                          <div className="text-[9px] font-mono text-slate-500 uppercase mb-0.5">{label}</div>
                                          <div className="text-xs font-semibold text-white">{value}</div>
                                        </div>
                                      ))}
                                    </div>
                                    <div className="mt-3 flex items-center gap-2">
                                      <Info className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                      <span className="text-[10px] text-slate-500 font-mono">
                                        To retry, block, or escalate this transaction — login as <span className="text-amber-400">Operator</span>
                                      </span>
                                    </div>
                                  </td>
                                </motion.tr>
                              )}
                            </AnimatePresence>
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── RECOVERY QUEUE ── */}
          {activeTab === 'recovery' && (
            <motion.div key="recovery" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="glass-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-amber-400" /> Active Recovery Queue
                  </h3>
                  <ReadOnlyBadge />
                </div>
                <div className="space-y-3">
                  {DEMO_RECOVERY_QUEUE.map((item) => (
                    <div key={item.id} className="p-4 rounded-xl bg-background-surface border border-background-border">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className="font-mono text-xs font-bold text-emerald-400">{item.txnId}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-amber-950 border border-amber-800 text-amber-300">{item.stage}</span>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                            <div>
                              <div className="text-[9px] font-mono text-slate-500 uppercase">Next Action</div>
                              <div className="text-white font-semibold mt-0.5">{item.nextAction}</div>
                            </div>
                            <div>
                              <div className="text-[9px] font-mono text-slate-500 uppercase">Scheduled At</div>
                              <div className="text-amber-400 font-mono font-semibold mt-0.5">{item.scheduledAt}</div>
                            </div>
                            <div>
                              <div className="text-[9px] font-mono text-slate-500 uppercase">AI Confidence</div>
                              <div className="text-white font-mono font-bold mt-0.5">{item.confidence}%</div>
                            </div>
                            <div>
                              <div className="text-[9px] font-mono text-slate-500 uppercase">Agent</div>
                              <div className="text-purple-400 font-mono font-semibold mt-0.5">{item.agent}</div>
                            </div>
                          </div>
                        </div>
                        {/* Action buttons — locked */}
                        <div className="flex flex-col gap-2 shrink-0">
                          <OperatorOnlyOverlay label="Approve" />
                          <OperatorOnlyOverlay label="Cancel" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── RISK SUMMARY ── */}
          {activeTab === 'risk' && (
            <motion.div key="risk" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="glass-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400" /> Risk Scores — All Transactions
                  </h3>
                  <ReadOnlyBadge />
                </div>
                <div className="space-y-2">
                  {DEMO_TRANSACTIONS.sort((a, b) => b.riskScore - a.riskScore).map((tx) => {
                    const risk = RISK_LEVELS[tx.risk];
                    return (
                      <div key={tx.id} className="flex items-center gap-3 p-3 rounded-xl bg-background-surface border border-background-border hover:border-slate-600 transition-colors">
                        <div className="w-12 text-right">
                          <span className={`text-lg font-black font-mono ${risk.color}`}>{tx.riskScore}</span>
                        </div>
                        <div className="w-32 bg-background-card rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-2 rounded-full ${tx.risk === 'HIGH' ? 'bg-red-500' : tx.risk === 'MEDIUM' ? 'bg-amber-500' : 'bg-emerald-500'}`}
                            style={{ width: `${tx.riskScore}%` }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-emerald-400 font-semibold">{tx.id}</span>
                            <span className={`text-[9px] font-mono font-black px-1.5 py-0.5 rounded border ${risk.bg} ${risk.border} ${risk.color}`}>{risk.label}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">{tx.customer} · ₹{tx.amount.toLocaleString()} · {tx.reason}</div>
                        </div>
                        {/* Lock buttons */}
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-slate-900 border border-slate-700 text-[10px] font-mono text-slate-600 cursor-not-allowed">
                            <Lock className="w-3 h-3" /> Flag
                          </span>
                          <span className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-slate-900 border border-slate-700 text-[10px] font-mono text-slate-600 cursor-not-allowed">
                            <Lock className="w-3 h-3" /> Block
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 p-3 rounded-xl bg-amber-950/30 border border-amber-700/30 flex items-center gap-2 text-xs text-amber-300">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>To flag, block, or escalate high-risk transactions, login as <strong>Operator</strong> at /login</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── ANALYTICS ── */}
          {activeTab === 'analytics' && (
            <motion.div key="analytics" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="glass-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-emerald-400" /> Recovery Analytics
                  </h3>
                  <ReadOnlyBadge />
                </div>
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={TREND_DATA}>
                    <defs>
                      <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, fontSize: 11 }} />
                    <Area type="monotone" dataKey="recovered" stroke="#10b981" strokeWidth={2} fill="url(#g1)" name="Recovered" />
                    <Area type="monotone" dataKey="failed" stroke="#ef4444" strokeWidth={2} fill="url(#g2)" name="Failed" />
                    <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: 'Best Recovery Day', value: 'Friday', sub: '88 transactions recovered', icon: TrendingUp, color: 'text-emerald-400' },
                  { label: 'Avg Risk Score', value: '52.6', sub: 'Across all transactions', icon: AlertCircle, color: 'text-amber-400' },
                  { label: 'Recovery Rate (7d)', value: '71.4%', sub: '6 of 7 days above 60%', icon: CheckCircle2, color: 'text-blue-400' },
                ].map(({ label, value, sub, icon: Icon, color }) => (
                  <div key={label} className="glass-card p-5">
                    <Icon className={`w-5 h-5 ${color} mb-2`} />
                    <div className={`text-2xl font-black font-mono ${color}`}>{value}</div>
                    <div className="text-xs font-semibold text-white mt-1">{label}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{sub}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <div className="text-center text-[10px] text-slate-600 font-mono flex items-center justify-center gap-2 pt-4">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          Read-Only Admin Session · RecoverAI Demo · {user?.merchantName}
        </div>
      </div>

      <SecurityShieldModal
        isOpen={showSecurityModal}
        onClose={() => setShowSecurityModal(false)}
      />
    </div>
  );
};
