import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RefreshCw,
  Play,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Filter,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { api, formatINR } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { RecoveryCase } from '../types';

export const RecoveryOperations: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [cases, setCases] = useState<RecoveryCase[]>([]);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  useEffect(() => {
    async function loadCases() {
      try {
        setLoading(true);
        const params: Record<string, unknown> = { page, limit: 20 };
        if (statusFilter) params.status = statusFilter;

        const data = await api.getRecoveryCases(params);
        if (data) {
          setCases(data.cases || []);
          setTotal(data.total || 0);
          setPages(data.pages || 1);
        }
      } catch (err) {
        console.warn('Failed to load recovery cases, using fallback:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCases();
  }, [page, statusFilter]);

  const tabs = [
    { label: 'All Cases', value: '' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Processing', value: 'PROCESSING' },
    { label: 'Recovered', value: 'RECOVERED' },
    { label: 'Escalated', value: 'ESCALATED' },
    { label: 'Blocked', value: 'BLOCKED' },
    { label: 'Failed', value: 'FAILED' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            Recovery Operations Hub
            <RefreshCw className="w-6 h-6 text-emerald-400" />
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage active recovery cases, human review queues, and policy-blocked transactions
          </p>
        </div>

        <button
          onClick={() => navigate('/simulator')}
          className="btn-primary text-xs py-2 px-4 shadow-glow-sm"
        >
          <Play className="w-3.5 h-3.5 fill-white" />
          New Recovery Simulation
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-background-border pb-3">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => {
              setStatusFilter(tab.value);
              setPage(1);
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === tab.value
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-glow-sm'
                : 'bg-background-surface/80 text-slate-400 hover:text-slate-200 border border-background-border'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Cases Table */}
      <div className="glass-card border-background-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="fintech-table">
            <thead>
              <tr>
                <th>Case / Transaction</th>
                <th>Amount</th>
                <th>AI Recommendation</th>
                <th>Risk</th>
                <th>Policy Result</th>
                <th>Final Action</th>
                <th>Execution Result</th>
                <th>Status</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                      <span>Loading recovery cases...</span>
                    </div>
                  </td>
                </tr>
              ) : cases.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-slate-400">
                    No recovery cases found for selected status filter.
                  </td>
                </tr>
              ) : (
                cases.map((c) => (
                  <tr
                    key={c._id || c.caseId}
                    onClick={() => navigate(`/transactions/${c.transactionId}`)}
                    className="cursor-pointer hover:bg-emerald-950/15 transition-colors"
                  >
                    <td>
                      <div className="font-mono text-xs font-bold text-emerald-400">
                        {c.transactionId}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {c.caseId}
                      </span>
                    </td>
                    <td>
                      <span className="font-mono font-bold text-white text-sm">
                        {formatINR(c.amount)}
                      </span>
                      {c.recoveredAmount > 0 && (
                        <span className="block text-[10px] font-mono text-emerald-400 font-semibold">
                          +{formatINR(c.recoveredAmount)}
                        </span>
                      )}
                    </td>
                    <td>
                      <StatusBadge status={c.aiRecommendedAction} size="sm" />
                    </td>
                    <td>
                      <span
                        className={`font-mono text-xs font-bold ${
                          c.riskScore <= 30
                            ? 'text-emerald-400'
                            : c.riskScore <= 70
                            ? 'text-amber-400'
                            : 'text-red-400'
                        }`}
                      >
                        {c.riskScore}/100
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={c.policyResult} size="sm" />
                    </td>
                    <td>
                      <StatusBadge status={c.finalAction} size="sm" />
                    </td>
                    <td>
                      <span className="font-mono text-xs text-slate-300">
                        {c.executionResult || '—'}
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={c.status} size="sm" />
                    </td>
                    <td className="text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/transactions/${c.transactionId}`);
                        }}
                        className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1"
                      >
                        View <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-background-border flex items-center justify-between text-xs text-slate-400">
          <span>
            Showing page <strong className="text-slate-200">{page}</strong> of{' '}
            <strong className="text-slate-200">{pages}</strong> ({total.toLocaleString()} total cases)
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 rounded bg-background-surface border border-background-border hover:bg-background-hover disabled:opacity-40"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              disabled={page >= pages}
              className="px-3 py-1.5 rounded bg-background-surface border border-background-border hover:bg-background-hover disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
