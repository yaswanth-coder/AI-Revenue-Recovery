import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ScrollText,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  X,
  Clock,
  Layers,
  FileCode,
} from 'lucide-react';
import { api, formatINR } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { AuditLog } from '../types';

export const AuditLogs: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  // Filters
  const [transactionIdFilter, setTransactionIdFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  // Selected Log Detail Modal
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  useEffect(() => {
    async function loadLogs() {
      try {
        setLoading(true);
        const params: Record<string, unknown> = { page, limit: 20 };
        if (transactionIdFilter) params.transactionId = transactionIdFilter;
        if (actionFilter) params.action = actionFilter;

        const data = await api.getAuditLogs(params);
        if (data) {
          setLogs(data.logs || []);
          setTotal(data.total || 0);
          setPages(data.pages || 1);
        }
      } catch (err) {
        console.warn('Failed to load audit logs, using fallback:', err);
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, [page, transactionIdFilter, actionFilter]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            Immutable Audit Ledger
            <ScrollText className="w-6 h-6 text-emerald-400" />
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Complete cryptographic audit trail for every AI diagnosis, policy check, and payment recovery action
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded-lg bg-background-surface border border-background-border text-xs font-mono text-slate-300">
          Total Logged Events: <strong className="text-emerald-400 font-bold">{total.toLocaleString()}</strong>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-card p-4 border-background-border">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={transactionIdFilter}
              onChange={(e) => {
                setTransactionIdFilter(e.target.value);
                setPage(1);
              }}
              placeholder="Search by Transaction ID (TXN_DEMO_001, etc.)..."
              className="w-full bg-background-surface border border-background-border rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          <select
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setPage(1);
            }}
            className="bg-background-surface border border-background-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
          >
            <option value="">All Action Types</option>
            <option value="ANALYSIS_COMPLETE">ANALYSIS_COMPLETE</option>
            <option value="RECOVERY_EXECUTED">RECOVERY_EXECUTED</option>
            <option value="ESCALATED">ESCALATED</option>
            <option value="BLOCKED">BLOCKED</option>
            <option value="TRANSACTION_DETECTED">TRANSACTION_DETECTED</option>
            <option value="SIMULATION_COMPLETE">SIMULATION_COMPLETE</option>
          </select>
        </div>
      </div>

      {/* Audit Table */}
      <div className="glass-card border-background-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="fintech-table">
            <thead>
              <tr>
                <th>Event ID</th>
                <th>Transaction</th>
                <th>Agent</th>
                <th>Action</th>
                <th>Reason / Summary</th>
                <th>Risk Score</th>
                <th>Policy Result</th>
                <th>Outcome</th>
                <th>Recovered</th>
                <th>Timestamp</th>
                <th className="text-right">Inspect</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={11} className="text-center py-12 text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                      <span>Loading audit records...</span>
                    </div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={11} className="text-center py-12 text-slate-400">
                    No audit records match the current filter.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr
                    key={log._id || log.eventId}
                    onClick={() => setSelectedLog(log)}
                    className="cursor-pointer hover:bg-emerald-950/15 transition-colors"
                  >
                    <td>
                      <span className="font-mono text-slate-400 text-xs truncate max-w-[80px] block">
                        {log.eventId ? log.eventId.slice(0, 8) + '...' : '—'}
                      </span>
                    </td>
                    <td>
                      <span className="font-mono text-emerald-400 font-bold text-xs">
                        {log.transactionId}
                      </span>
                    </td>
                    <td>
                      <span className="text-xs text-slate-300 font-mono">
                        {log.agent}
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={log.action} size="sm" />
                    </td>
                    <td>
                      <span className="text-xs text-slate-300 truncate max-w-[220px] block">
                        {log.reason}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`font-mono text-xs font-bold ${
                          (log.riskScore || 0) <= 30
                            ? 'text-emerald-400'
                            : (log.riskScore || 0) <= 70
                            ? 'text-amber-400'
                            : 'text-red-400'
                        }`}
                      >
                        {log.riskScore !== null ? `${log.riskScore}` : '—'}
                      </span>
                    </td>
                    <td>
                      {log.policyResult ? (
                        <StatusBadge status={log.policyResult} size="sm" />
                      ) : (
                        <span className="text-slate-500 font-mono text-xs">—</span>
                      )}
                    </td>
                    <td>
                      <span className="font-mono text-xs text-slate-300">
                        {log.executionResult || '—'}
                      </span>
                    </td>
                    <td>
                      <span className="font-mono text-xs font-bold text-emerald-400">
                        {log.recoveredAmount > 0 ? `+${formatINR(log.recoveredAmount)}` : '₹0'}
                      </span>
                    </td>
                    <td>
                      <span className="text-[11px] font-mono text-slate-400">
                        {new Date(log.timestamp).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </span>
                    </td>
                    <td className="text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLog(log);
                        }}
                        className="text-xs font-semibold text-emerald-400 hover:text-emerald-300"
                      >
                        Details →
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
            <strong className="text-slate-200">{pages}</strong> ({total.toLocaleString()} records)
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

      {/* Selected Event Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card max-w-lg w-full p-6 border-emerald-900/60 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-background-border pb-3">
              <div className="flex items-center gap-2">
                <ScrollText className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white font-mono">
                  Audit Event Details
                </h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-background-border/50">
                <span className="text-slate-400">Event UUID:</span>
                <span className="text-slate-200">{selectedLog.eventId}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-background-border/50">
                <span className="text-slate-400">Transaction ID:</span>
                <span
                  onClick={() => navigate(`/transactions/${selectedLog.transactionId}`)}
                  className="text-emerald-400 font-bold cursor-pointer hover:underline"
                >
                  {selectedLog.transactionId} →
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-background-border/50">
                <span className="text-slate-400">Agent:</span>
                <span className="text-purple-300 font-semibold">{selectedLog.agent}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-background-border/50">
                <span className="text-slate-400">Action:</span>
                <StatusBadge status={selectedLog.action} size="sm" />
              </div>
              <div className="flex justify-between py-1 border-b border-background-border/50">
                <span className="text-slate-400">Risk Score:</span>
                <span className="text-slate-200 font-bold">
                  {selectedLog.riskScore !== null ? `${selectedLog.riskScore} / 100` : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-background-border/50">
                <span className="text-slate-400">Policy Check:</span>
                <span className="text-slate-200">{selectedLog.policyResult || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-background-border/50">
                <span className="text-slate-400">Recovered Amount:</span>
                <span className="text-emerald-400 font-bold">
                  {formatINR(selectedLog.recoveredAmount)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-background-border/50">
                <span className="text-slate-400">Timestamp:</span>
                <span className="text-slate-300">
                  {new Date(selectedLog.timestamp).toISOString()}
                </span>
              </div>

              <div className="pt-2">
                <span className="text-slate-400 block mb-1">Reason / Description:</span>
                <p className="p-2.5 rounded bg-background-surface text-slate-200 text-xs leading-relaxed font-sans">
                  {selectedLog.reason}
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button onClick={() => setSelectedLog(null)} className="btn-primary text-xs py-2 px-4">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
