import React, { useState, useEffect } from 'react';
import {
  SlidersHorizontal,
  ShieldCheck,
  ShieldAlert,
  RotateCcw,
  Save,
  Check,
  AlertTriangle,
  Lock,
  Sparkles,
} from 'lucide-react';
import { api } from '../services/api';
import { Policy } from '../types';

export const Policies: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [policies, setPolicies] = useState<Policy[]>([
    {
      policyId: 'POL_001',
      name: 'Automatic Retry Limit',
      description: 'Maximum number of automatic retry attempts before escalation.',
      key: 'MAX_AUTO_RETRIES',
      value: 1,
      type: 'number',
      enabled: true,
      category: 'Recovery',
    },
    {
      policyId: 'POL_002',
      name: 'High-Value Transaction Threshold',
      description: 'Transactions above this amount require human approval for recovery.',
      key: 'HIGH_VALUE_THRESHOLD',
      value: 50000,
      type: 'number',
      enabled: true,
      category: 'Authorization',
    },
    {
      policyId: 'POL_003',
      name: 'Maximum Failures Before Escalation',
      description: 'Number of failures before a transaction is automatically escalated to human review.',
      key: 'MAX_FAILURES_BEFORE_ESCALATION',
      value: 3,
      type: 'number',
      enabled: true,
      category: 'Escalation',
    },
    {
      policyId: 'POL_004',
      name: 'High-Risk Score Threshold',
      description: 'Transactions with risk score above this value cannot be automatically recovered.',
      key: 'HIGH_RISK_THRESHOLD',
      value: 70,
      type: 'number',
      enabled: true,
      category: 'Risk',
    },
    {
      policyId: 'POL_005',
      name: 'Idempotency Protection',
      description: 'Prevents the same recovery action from executing twice for the same transaction.',
      key: 'IDEMPOTENCY_CHECK',
      value: true,
      type: 'boolean',
      enabled: true,
      category: 'Safety',
    },
  ]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadPolicies() {
      try {
        setLoading(true);
        const data = await api.getPolicies();
        if (data && data.length > 0) {
          setPolicies(data);
        }
      } catch (err) {
        console.warn('Failed to load live policies, using defaults:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPolicies();
  }, []);

  const handleToggle = (policyId: string) => {
    setPolicies((prev) =>
      prev.map((p) => (p.policyId === policyId ? { ...p, enabled: !p.enabled } : p))
    );
  };

  const handleChangeValue = (policyId: string, val: number | boolean | string) => {
    setPolicies((prev) =>
      prev.map((p) => (p.policyId === policyId ? { ...p, value: val } : p))
    );
  };

  const handleSavePolicy = async (policy: Policy) => {
    try {
      setSaving(true);
      await api.updatePolicy(policy.policyId, policy.value, policy.enabled);
      setSuccessMessage(`Policy "${policy.name}" updated successfully.`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Failed to update policy:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = async () => {
    try {
      setSaving(true);
      const res = await api.resetPolicies();
      if (res) setPolicies(res);
      setSuccessMessage('All policies reset to financial safety defaults.');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Failed to reset policies:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            Policy Engine Configuration
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Configure hard deterministic boundaries that govern autonomous AI decision-making
          </p>
        </div>

        <button
          onClick={handleResetDefaults}
          disabled={saving}
          className="btn-secondary text-xs py-2 px-4"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Defaults
        </button>
      </div>

      {/* Safety Notice Banner */}
      <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-xs text-emerald-300 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-white block">
            Immutable Deterministic Policy Layer Active
          </span>
          <p className="text-slate-300 leading-relaxed">
            The AI agent recommends recovery actions, but the Policy Engine evaluates all rules deterministically.
            Changes saved below directly modify runtime recovery decisions across the entire platform.
          </p>
        </div>
      </div>

      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/60 text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Policies Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {policies.map((policy) => {
          return (
            <div
              key={policy.policyId}
              className={`glass-card p-5 border transition-all flex flex-col justify-between ${
                policy.enabled ? 'border-emerald-900/40' : 'border-slate-800 opacity-70'
              }`}
            >
              <div>
                {/* Policy Header & Toggle */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-semibold block">
                      {policy.category} • {policy.key}
                    </span>
                    <h3 className="text-sm font-bold text-white mt-0.5">{policy.name}</h3>
                  </div>

                  <button
                    onClick={() => handleToggle(policy.policyId)}
                    className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      policy.enabled ? 'bg-emerald-500' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        policy.enabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  {policy.description}
                </p>

                {/* Threshold input control */}
                {policy.type === 'number' && (
                  <div className="p-3 rounded-lg bg-background-surface border border-background-border">
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Threshold Parameter
                    </label>
                    <div className="relative">
                      {policy.key.includes('THRESHOLD') && policy.key.includes('VALUE') && (
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-slate-400 font-bold">
                          ₹
                        </span>
                      )}
                      <input
                        type="number"
                        value={Number(policy.value)}
                        onChange={(e) => handleChangeValue(policy.policyId, Number(e.target.value))}
                        disabled={!policy.enabled}
                        className={`w-full bg-background-card border border-background-border rounded-lg py-1.5 text-xs font-mono font-bold text-white focus:outline-none focus:border-emerald-500 ${
                          policy.key.includes('THRESHOLD') && policy.key.includes('VALUE') ? 'pl-7 pr-3' : 'px-3'
                        }`}
                      />
                    </div>
                  </div>
                )}

                {policy.type === 'boolean' && (
                  <div className="p-3 rounded-lg bg-background-surface border border-background-border flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-300">Enforcement Mode:</span>
                    <span className="text-emerald-400 font-bold">STRICT IDEMPOTENCY</span>
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="mt-4 pt-3 border-t border-background-border flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-500">
                  {policy.enabled ? '● Active Rule' : '○ Inactive'}
                </span>
                <button
                  onClick={() => handleSavePolicy(policy)}
                  disabled={saving}
                  className="btn-primary text-xs py-1.5 px-3"
                >
                  <Save className="w-3 h-3" /> Save Changes
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
