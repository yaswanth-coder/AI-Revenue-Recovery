import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingDown,
  TrendingUp,
  Percent,
  RefreshCw,
  Receipt,
  AlertTriangle,
  Bot,
  ArrowRight,
  ShieldCheck,
  Zap,
  Sparkles,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import { KPICard } from '../components/KPICard';
import { AgentStatusPanel } from '../components/AgentStatusPanel';
import { RevenueRecoveryNetwork } from '../three/RevenueRecoveryNetwork';
import { StatusBadge } from '../components/StatusBadge';
import { api, formatINR, formatINRCompact } from '../services/api';
import { KPIStats, AgentDecision, AuditLog } from '../types';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<KPIStats>({
    revenueAtRisk: 842500,
    revenueRecovered: 591250,
    recoveryRate: 70.1,
    activeCases: 247,
    transactionsAnalyzed: 10000,
    humanEscalations: 117,
    agentDecisions: 1627,
    actionsBlocked: 64,
  });
  const [recentDecisions, setRecentDecisions] = useState<AgentDecision[]>([]);
  const [recentActivity, setRecentActivity] = useState<AuditLog[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await api.getDashboard();
        if (data?.kpis) {
          setKpis(data.kpis);
          setRecentDecisions(data.recentDecisions || []);
          setRecentActivity(data.recentActivity || []);
        }
      } catch (err) {
        console.warn('Backend unavailable, using seeded defaults:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Financial trend chart data
  const trendData = [
    { day: 'Mon', atRisk: 120000, recovered: 88000 },
    { day: 'Tue', atRisk: 145000, recovered: 105000 },
    { day: 'Wed', atRisk: 110000, recovered: 78000 },
    { day: 'Thu', atRisk: 160000, recovered: 118000 },
    { day: 'Fri', atRisk: 180000, recovered: 132000 },
    { day: 'Sat', atRisk: 135000, recovered: 96000 },
    { day: 'Sun', atRisk: 92500, recovered: 74250 },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            Revenue Recovery Command Center
            <Sparkles className="w-5 h-5 text-emerald-400" />
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Autonomous failure detection, bounded AI decisioning & verified financial recovery
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/simulator')}
            className="btn-primary text-xs py-2 px-4 shadow-glow-sm"
          >
            <Zap className="w-3.5 h-3.5 fill-white" />
            Run Simulation
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        <KPICard
          title="Revenue At Risk"
          value={formatINR(kpis.revenueAtRisk)}
          subtitle="Unrecovered failures"
          variant="amber"
          icon={TrendingDown}
        />
        <KPICard
          title="Revenue Recovered"
          value={formatINR(kpis.revenueRecovered)}
          subtitle="+14.2% this week"
          change="+14.2%"
          isPositive={true}
          variant="emerald"
          icon={TrendingUp}
        />
        <KPICard
          title="Recovery Rate"
          value={`${kpis.recoveryRate}%`}
          subtitle="Target: >65.0%"
          change="+3.8%"
          isPositive={true}
          variant="emerald"
          icon={Percent}
        />
        <KPICard
          title="Active Cases"
          value={kpis.activeCases.toLocaleString()}
          subtitle="Under AI evaluation"
          variant="slate"
          icon={RefreshCw}
        />
        <KPICard
          title="Analyzed"
          value={kpis.transactionsAnalyzed.toLocaleString()}
          subtitle="Total telemetry stream"
          variant="purple"
          icon={Receipt}
        />
        <KPICard
          title="Escalations"
          value={kpis.humanEscalations.toLocaleString()}
          subtitle="High-risk / policy blocks"
          variant="red"
          icon={AlertTriangle}
        />
      </div>

      {/* Central Interactive Section: 3D Network + Agent Status */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueRecoveryNetwork />
        </div>
        <div className="lg:col-span-1 flex flex-col">
          <AgentStatusPanel
            stats={{
              transactionsAnalyzed: kpis.transactionsAnalyzed,
              decisionsTotal: kpis.agentDecisions,
              actionsExecuted: kpis.transactionsAnalyzed ? Math.round(kpis.agentDecisions * 0.88) : 1446,
              actionsBlocked: kpis.actionsBlocked,
              escalations: kpis.humanEscalations,
              revenueRecovered: kpis.revenueRecovered,
            }}
          />
        </div>
      </div>

      {/* Revenue Recovery Trend Chart & Breakdown */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 glass-card p-5 border-emerald-900/40">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Revenue Recovery Velocity
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </h3>
              <p className="text-xs text-slate-400">
                Daily comparison of Revenue At Risk vs Verified Recovered Revenue
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400" />
                <span className="text-slate-300">Recovered</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
                <span className="text-slate-300">At Risk</span>
              </div>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorRecovered" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(v) => formatINRCompact(v)}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0c130f',
                    borderColor: '#1a2920',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                  }}
                  formatter={(value: number) => [formatINR(value)]}
                />
                <Area
                  type="monotone"
                  dataKey="atRisk"
                  stroke="#f59e0b"
                  fillOpacity={1}
                  fill="url(#colorRisk)"
                  strokeWidth={2}
                  name="At Risk"
                />
                <Area
                  type="monotone"
                  dataKey="recovered"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#colorRecovered)"
                  strokeWidth={2.5}
                  name="Recovered"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Decision Engine Status Summary */}
        <div className="glass-card p-5 border-emerald-900/40 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center justify-between">
              <span>Policy Guardrail Health</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Deterministic verification of all AI recovery decisions
            </p>

            <div className="mt-4 space-y-3">
              <div className="p-3 rounded-lg bg-background-surface/80 border border-background-border">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">Automatic Retry Limit</span>
                  <span className="font-mono text-emerald-400 font-bold">1 Attempt</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-emerald-400 h-full rounded-full w-full" />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-background-surface/80 border border-background-border">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">High-Value Threshold</span>
                  <span className="font-mono text-cyan-400 font-bold">₹50,000 Max</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-cyan-400 h-full rounded-full w-full" />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-background-surface/80 border border-background-border">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">High-Risk Escalation</span>
                  <span className="font-mono text-amber-400 font-bold">Score &gt; 70</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-amber-400 h-full rounded-full w-full" />
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('/policies')}
            className="btn-secondary text-xs w-full mt-4 justify-center"
          >
            Configure Financial Policies
          </button>
        </div>
      </div>

      {/* Recent AI Decisions & Recovery Activity Tables */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent AI Decisions */}
        <div className="glass-card p-5 border-emerald-900/40">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Bot className="w-4 h-4 text-purple-400" />
                Recent AI Decisions
              </h3>
              <p className="text-xs text-slate-400">
                Autonomous failure diagnosis & recommended action
              </p>
            </div>
            <button
              onClick={() => navigate('/agent')}
              className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium"
            >
              View All <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="fintech-table">
              <thead>
                <tr>
                  <th>Transaction</th>
                  <th>Amount</th>
                  <th>Failure</th>
                  <th>Risk</th>
                  <th>Policy</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentDecisions.length === 0 ? (
                  <>
                    <tr
                      onClick={() => navigate('/transactions/TXN_DEMO_001')}
                      className="cursor-pointer hover:bg-emerald-950/20"
                    >
                      <td className="font-mono text-emerald-400 font-semibold">TXN_DEMO_001</td>
                      <td className="font-mono font-bold">₹2,499</td>
                      <td className="text-slate-300">BANK_TIMEOUT</td>
                      <td>
                        <span className="font-mono text-xs text-emerald-400">18 / 100</span>
                      </td>
                      <td>
                        <StatusBadge status="ALLOWED" size="sm" />
                      </td>
                      <td>
                        <StatusBadge status="RETRY" size="sm" />
                      </td>
                    </tr>
                    <tr
                      onClick={() => navigate('/transactions/TXN_DEMO_002')}
                      className="cursor-pointer hover:bg-red-950/20"
                    >
                      <td className="font-mono text-red-400 font-semibold">TXN_DEMO_002</td>
                      <td className="font-mono font-bold">₹25,000</td>
                      <td className="text-slate-300">CARD_DECLINED</td>
                      <td>
                        <span className="font-mono text-xs text-red-400">86 / 100</span>
                      </td>
                      <td>
                        <StatusBadge status="BLOCKED" size="sm" />
                      </td>
                      <td>
                        <StatusBadge status="ESCALATED" size="sm" />
                      </td>
                    </tr>
                  </>
                ) : (
                  recentDecisions.slice(0, 5).map((d) => (
                    <tr
                      key={d._id || d.decisionId}
                      onClick={() => navigate(`/transactions/${d.transactionId}`)}
                      className="cursor-pointer hover:bg-emerald-950/20"
                    >
                      <td className="font-mono text-emerald-400 font-semibold">
                        {d.transactionId}
                      </td>
                      <td className="font-mono font-bold">{formatINR(d.amount)}</td>
                      <td className="text-slate-300 text-xs truncate max-w-[100px]">
                        {d.failureReason}
                      </td>
                      <td>
                        <span
                          className={`font-mono text-xs font-semibold ${
                            d.riskScore <= 30
                              ? 'text-emerald-400'
                              : d.riskScore <= 70
                              ? 'text-amber-400'
                              : 'text-red-400'
                          }`}
                        >
                          {d.riskScore}
                        </span>
                      </td>
                      <td>
                        <StatusBadge status={d.policyResult} size="sm" />
                      </td>
                      <td>
                        <StatusBadge status={d.finalAction} size="sm" />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Recovery Activity / Audit Log */}
        <div className="glass-card p-5 border-emerald-900/40">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-emerald-400" />
                Live Recovery Activity
              </h3>
              <p className="text-xs text-slate-400">
                Verified execution logs & financial impact
              </p>
            </div>
            <button
              onClick={() => navigate('/audit')}
              className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium"
            >
              Audit Trail <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2.5">
            <div
              onClick={() => navigate('/transactions/TXN_DEMO_001')}
              className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-800/40 flex items-center justify-between cursor-pointer hover:bg-emerald-950/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-white">TXN_DEMO_001</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                      RECOVERED
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    ₹2,499 recovered via UPI retry verification
                  </p>
                </div>
              </div>
              <span className="font-mono text-xs font-bold text-emerald-400">
                +₹2,499
              </span>
            </div>

            <div
              onClick={() => navigate('/transactions/TXN_DEMO_002')}
              className="p-3 rounded-lg bg-amber-950/20 border border-amber-800/40 flex items-center justify-between cursor-pointer hover:bg-amber-950/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-white">TXN_DEMO_002</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono">
                      ESCALATED
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Policy blocked retry: Risk 86 exceeds threshold (70)
                  </p>
                </div>
              </div>
              <span className="font-mono text-xs font-semibold text-amber-400">
                ₹25,000 Review
              </span>
            </div>

            {recentActivity.slice(0, 3).map((act) => (
              <div
                key={act._id || act.eventId}
                onClick={() => navigate(`/transactions/${act.transactionId}`)}
                className="p-3 rounded-lg bg-background-surface/80 border border-background-border flex items-center justify-between cursor-pointer hover:bg-background-hover transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-slate-500" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-white">
                        {act.transactionId}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 uppercase">
                        {act.action}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 truncate max-w-[280px]">
                      {act.reason}
                    </p>
                  </div>
                </div>
                {act.recoveredAmount > 0 && (
                  <span className="font-mono text-xs font-bold text-emerald-400">
                    +{formatINR(act.recoveredAmount)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
