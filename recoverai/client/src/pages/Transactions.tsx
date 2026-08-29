import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Receipt,
  Search,
  ArrowRight,
  RefreshCw,
  SlidersHorizontal,
} from 'lucide-react';
import { api, formatINR } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { Transaction } from '../types';

export const Transactions: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  // Search and Filters
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    async function loadTransactions() {
      try {
        setLoading(true);
        const params: Record<string, unknown> = {
          page,
          limit: 20,
          sort: '-timestamp',
        };
        if (search) params.search = search;
        if (paymentMethod) params.paymentMethod = paymentMethod;
        if (status) params.status = status;

        const data = await api.getTransactions(params);
        if (data) {
          setTransactions(data.transactions || []);
          setTotal(data.total || 0);
          setPages(data.pages || 1);
        }
      } catch (err) {
        console.warn('Failed to load transactions, using seeded defaults:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTransactions();
  }, [page, search, paymentMethod, status]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            Transaction Registry
            <Receipt className="w-6 h-6 text-emerald-400" />
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Complete transaction history with real-time risk scores and recovery telemetry
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/transactions/TXN_DEMO_001')}
            className="px-3 py-1.5 rounded-lg text-xs font-mono bg-emerald-950/40 text-emerald-300 border border-emerald-800/60 hover:bg-emerald-900/60"
          >
            Inspect TXN_DEMO_001
          </button>
          <button
            onClick={() => navigate('/transactions/TXN_DEMO_002')}
            className="px-3 py-1.5 rounded-lg text-xs font-mono bg-red-950/40 text-red-300 border border-red-800/60 hover:bg-red-900/60"
          >
            Inspect TXN_DEMO_002
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-card p-4 border-background-border">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search TXN_8231, TXN_DEMO_001, customer..."
              className="w-full bg-background-surface border border-background-border rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          {/* Payment Method */}
          <select
            value={paymentMethod}
            onChange={(e) => {
              setPaymentMethod(e.target.value);
              setPage(1);
            }}
            className="bg-background-surface border border-background-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Payment Methods</option>
            <option value="UPI">UPI</option>
            <option value="CREDIT_CARD">Credit Card</option>
            <option value="DEBIT_CARD">Debit Card</option>
            <option value="NET_BANKING">Net Banking</option>
            <option value="WALLET">Wallet</option>
          </select>

          {/* Status */}
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="bg-background-surface border border-background-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Statuses</option>
            <option value="FAILED">FAILED</option>
            <option value="RECOVERED">RECOVERED</option>
            <option value="ESCALATED">ESCALATED</option>
            <option value="BLOCKED">BLOCKED</option>
            <option value="PENDING">PENDING</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="glass-card border-background-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="fintech-table">
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Payment Method</th>
                <th>Status</th>
                <th>Failure Reason</th>
                <th>Risk Score</th>
                <th>Recovery Prob</th>
                <th>Recovery Status</th>
                <th>Timestamp</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={11} className="text-center py-12 text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                      <span>Loading transaction records...</span>
                    </div>
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={11} className="text-center py-12 text-slate-400">
                    No transactions match your search query.
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
                      <span className="font-mono font-bold text-emerald-400 text-xs">
                        {tx.transactionId}
                      </span>
                    </td>
                    <td>
                      <span className="text-slate-200 font-medium text-xs">{tx.customerName}</span>
                      <span className="block text-[10px] text-slate-500 font-mono">
                        {tx.customerId}
                      </span>
                    </td>
                    <td>
                      <span className="font-mono font-bold text-white text-xs">
                        {formatINR(tx.amount)}
                      </span>
                    </td>
                    <td>
                      <span className="text-xs font-mono text-slate-300">
                        {tx.paymentMethod}
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={tx.status} size="sm" />
                    </td>
                    <td>
                      <span className="text-xs font-mono text-slate-300 truncate max-w-[120px] block">
                        {tx.failureReason}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`font-mono text-xs font-bold ${
                          tx.riskScore <= 30
                            ? 'text-emerald-400'
                            : tx.riskScore <= 70
                            ? 'text-amber-400'
                            : 'text-red-400'
                        }`}
                      >
                        {tx.riskScore}
                      </span>
                    </td>
                    <td>
                      <span className="font-mono text-xs text-slate-200 font-semibold">
                        {tx.recoveryProbability}%
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={tx.recoveryStatus} size="sm" />
                    </td>
                    <td>
                      <span className="text-[11px] font-mono text-slate-400">
                        {new Date(tx.timestamp).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </td>
                    <td className="text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/transactions/${tx.transactionId}`);
                        }}
                        className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1"
                      >
                        Details <ArrowRight className="w-3.5 h-3.5" />
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
            <strong className="text-slate-200">{pages}</strong> ({total.toLocaleString()} transactions)
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
