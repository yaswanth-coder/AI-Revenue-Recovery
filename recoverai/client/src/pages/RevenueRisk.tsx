import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingDown,
  Filter,
  Search,
  ArrowUpDown,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { api, formatINR } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { Transaction } from '../types';

export const RevenueRisk: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  // Filters
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [failureReasonFilter, setFailureReasonFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortField, setSortField] = useState('-amount');

  useEffect(() => {
    async function loadTransactions() {
      try {
        setLoading(true);
        const params: Record<string, unknown> = {
          page,
          limit: 20,
          sort: sortField,
        };
        if (search) params.search = search;
        if (riskFilter) params.risk = riskFilter;
        if (failureReasonFilter) params.failureReason = failureReasonFilter;
        if (statusFilter) params.status = statusFilter;

        const data = await api.getTransactions(params);
        if (data) {
          setTransactions(data.transactions || []);
          setTotal(data.total || 0);
          setPages(data.pages || 1);
        }
      } catch (err) {
        console.warn('Failed to load transactions, using fallbacks:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTransactions();
  }, [page, search, riskFilter, failureReasonFilter, statusFilter, sortField]);

  // Aggregate totals
  const totalAtRisk = transactions.reduce((sum, tx) => sum + (tx.status !== 'RECOVERED' ? tx.amount : 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            Revenue At Risk Registry
            <TrendingDown className="w-6 h-6 text-amber-400" />
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time queue of failed payment transactions prioritized by recovery probability
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-amber-950/30 border border-amber-800/40 text-xs font-mono">
            <span className="text-slate-400 block text-[10px] uppercase">Filter Total at Risk</span>
            <span className="text-amber-400 font-bold text-base">{formatINR(totalAtRisk)}</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-card p-4 border-background-border space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ID, customer..."
              className="w-full bg-background-surface border border-background-border rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Risk Level */}
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="bg-background-surface border border-background-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Risk Levels</option>
            <option value="LOW">LOW (0 - 30)</option>
            <option value="MEDIUM">MEDIUM (31 - 70)</option>
            <option value="HIGH">HIGH (71 - 100)</option>
          </select>

          {/* Failure Reason */}
          <select
            value={failureReasonFilter}
            onChange={(e) => setFailureReasonFilter(e.target.value)}
            className="bg-background-surface border border-background-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Failure Types</option>
            <option value="BANK_TIMEOUT">BANK_TIMEOUT</option>
            <option value="CARD_DECLINED">CARD_DECLINED</option>
            <option value="INSUFFICIENT_FUNDS">INSUFFICIENT_FUNDS</option>
            <option value="NETWORK_ERROR">NETWORK_ERROR</option>
            <option value="AUTHENTICATION_FAILURE">AUTHENTICATION_FAILURE</option>
            <option value="EXPIRED_CARD">EXPIRED_CARD</option>
          </select>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-background-surface border border-background-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Statuses</option>
            <option value="FAILED">FAILED</option>
            <option value="PENDING">PENDING</option>
            <option value="ESCALATED">ESCALATED</option>
            <option value="BLOCKED">BLOCKED</option>
            <option value="RECOVERED">RECOVERED</option>
          </select>

          {/* Sort */}
          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value)}
            className="bg-background-surface border border-background-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="-amount">Amount (High to Low)</option>
            <option value="amount">Amount (Low to High)</option>
            <option value="-recoveryProbability">Recovery Probability (High)</option>
            <option value="-riskScore">Risk Score (High to Low)</option>
            <option value="riskScore">Risk Score (Low to High)</option>
            <option value="-timestamp">Latest First</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card border-background-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="fintech-table">
            <thead>
              <tr>
                <th>Transaction</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Failure Reason</th>
                <th>Risk Score</th>
                <th>Recovery Prob</th>
                <th>Recommended Action</th>
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
                      <span>Loading revenue risk registry...</span>
                    </div>
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-slate-400">
                    No transactions match current filters.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr
                    key={tx._id || tx.transactionId}
                    onClick={() => navigate(`/transactions/${tx.transactionId}`)}
                    className="cursor-pointer hover:bg-emerald-950/15 transition-colors"
                  >
                    <td>
                      <span className="font-mono font-bold text-emerald-400">
                        {tx.transactionId}
                      </span>
                    </td>
                    <td>
                      <span className="text-slate-200 font-medium">{tx.customerName}</span>
                      <span className="block text-[10px] text-slate-500 font-mono">
                        {tx.customerId}
                      </span>
                    </td>
                    <td>
                      <span className="font-mono font-bold text-white text-sm">
                        {formatINR(tx.amount)}
                      </span>
                    </td>
                    <td>
                      <span className="text-xs text-slate-300 font-mono">
                        {tx.failureReason}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-mono text-xs font-bold ${
                            tx.riskScore <= 30
                              ? 'text-emerald-400'
                              : tx.riskScore <= 70
                              ? 'text-amber-400'
                              : 'text-red-400'
                          }`}
                        >
                          {tx.riskScore}/100
                        </span>
                        <span className="text-[10px] text-slate-500 font-semibold">
                          ({tx.riskLevel})
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              tx.recoveryProbability >= 70
                                ? 'bg-emerald-400'
                                : tx.recoveryProbability >= 40
                                ? 'bg-amber-400'
                                : 'bg-red-400'
                            }`}
                            style={{ width: `${tx.recoveryProbability}%` }}
                          />
                        </div>
                        <span className="font-mono text-xs text-slate-300 font-bold">
                          {tx.recoveryProbability}%
                        </span>
                      </div>
                    </td>
                    <td>
                      <StatusBadge status={tx.recommendedAction} size="sm" />
                    </td>
                    <td>
                      <StatusBadge status={tx.status} size="sm" />
                    </td>
                    <td className="text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/transactions/${tx.transactionId}`);
                        }}
                        className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1"
                      >
                        Inspect <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-background-border flex items-center justify-between text-xs text-slate-400">
          <span>
            Showing page <strong className="text-slate-200">{page}</strong> of{' '}
            <strong className="text-slate-200">{pages}</strong> ({total.toLocaleString()} transactions)
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 rounded bg-background-surface border border-background-border hover:bg-background-hover disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              disabled={page >= pages}
              className="px-3 py-1.5 rounded bg-background-surface border border-background-border hover:bg-background-hover disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
