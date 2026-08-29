import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Settings,
  ShieldCheck,
  Bell,
  CreditCard,
  Cpu,
  Save,
  CheckCircle2,
  Wrench,
  RefreshCw,
  UserCheck,
  UserCog,
  ChevronRight,
  Globe,
  Lock,
  Zap,
  BarChart3,
  Phone,
  Mail,
  Building2,
  Briefcase,
  ToggleLeft,
  ToggleRight,
  AlertTriangle,
  Info,
  Activity,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

type ProfileTab = 'overview' | 'preferences' | 'payout' | 'maintainer' | 'security';

const tabConfig: { id: ProfileTab; label: string; icon: React.ElementType; maintainerOnly?: boolean }[] = [
  { id: 'overview', label: 'Profile', icon: User },
  { id: 'preferences', label: 'Preferences', icon: Bell },
  { id: 'payout', label: 'Payout Account', icon: CreditCard, maintainerOnly: false },
  { id: 'maintainer', label: 'System Config', icon: Cpu, maintainerOnly: true },
  { id: 'security', label: 'Security', icon: Lock },
];

function StatusBadge({ persona }: { persona: 'USER' | 'MAINTAINER' }) {
  return persona === 'MAINTAINER' ? (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/40 text-purple-300 text-xs font-bold">
      <Wrench className="w-3 h-3" /> MAINTAINER
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
      <UserCheck className="w-3 h-3" /> MERCHANT USER
    </span>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`w-10 h-5 rounded-full transition-colors flex items-center ${
        checked ? 'bg-emerald-500' : 'bg-slate-700'
      }`}
    >
      <span
        className={`w-4 h-4 rounded-full bg-white shadow transition-transform mx-0.5 ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

function SaveButton({ onClick, saved }: { onClick: () => void; saved: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`btn-primary text-xs py-2 px-4 flex items-center gap-2 transition-all ${
        saved ? 'bg-emerald-600' : ''
      }`}
    >
      {saved ? (
        <>
          <CheckCircle2 className="w-3.5 h-3.5" /> Saved!
        </>
      ) : (
        <>
          <Save className="w-3.5 h-3.5" /> Save Changes
        </>
      )}
    </button>
  );
}

export const Profile: React.FC = () => {
  const { user, updateUser, switchPersona, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<ProfileTab>('overview');
  const [saved, setSaved] = useState(false);
  const [switchingPersona, setSwitchingPersona] = useState(false);

  // Local editable state
  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [merchantName, setMerchantName] = useState(user?.merchantName ?? '');
  const [department, setDepartment] = useState(user?.department ?? '');

  // Preferences
  const [prefs, setPrefs] = useState(
    user?.preferences ?? {
      autoRetryNotifications: true,
      escalationAlerts: true,
      smsAlerts: false,
      emailReports: 'DAILY' as const,
      webhookUrl: 'https://api.acmepayments.in/v1/webhooks/recoverai',
      aiConfidenceThreshold: 75,
    }
  );

  // Payout
  const [payout, setPayout] = useState(
    user?.payoutAccount ?? {
      bankName: 'HDFC Bank Ltd.',
      accountNumber: '•••• •••• 8291',
      ifscCode: 'HDFC0001234',
    }
  );

  // Maintainer Settings
  const [mSettings, setMSettings] = useState(
    user?.maintainerSettings ?? {
      aiModel: 'gemini-pro / deterministic',
      circuitBreakerActive: true,
      telemetryLevel: 'INFO' as const,
      logRetentionDays: 90,
      workerNodes: 4,
    }
  );

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleSave = async () => {
    const updates: Record<string, unknown> = {
      name,
      phone,
      merchantName,
      department,
      preferences: prefs,
      payoutAccount: payout,
      maintainerSettings: mSettings,
    };
    updateUser(updates as any);

    // Persist to backend
    try {
      await api.updateProfile({ email: user?.email, ...updates });
    } catch {
      // Silently continue — local state is updated
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handlePersonaSwitch = async (target: 'USER' | 'MAINTAINER') => {
    if (target === user?.persona) return;
    setSwitchingPersona(true);
    await switchPersona(target);
    setSwitchingPersona(false);
  };

  const visibleTabs = tabConfig.filter(
    (t) => !t.maintainerOnly || user?.persona === 'MAINTAINER'
  );

  const isMaintainer = user?.persona === 'MAINTAINER';

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Operator Profile</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Manage your identity, preferences, and system settings
          </p>
        </div>
        <SaveButton onClick={handleSave} saved={saved} />
      </div>

      {/* Identity Hero Card */}
      <div className={`glass-card p-6 border ${isMaintainer ? 'border-purple-800/40' : 'border-emerald-800/30'} relative overflow-hidden`}>
        <div
          className={`absolute top-0 right-0 w-72 h-72 rounded-full opacity-10 blur-3xl pointer-events-none ${
            isMaintainer ? 'bg-purple-600' : 'bg-emerald-600'
          }`}
        />

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Avatar */}
          <div
            className={`w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black shadow-xl flex-shrink-0 ${
              isMaintainer
                ? 'bg-gradient-to-tr from-purple-700 to-purple-400 text-black'
                : 'bg-gradient-to-tr from-emerald-600 to-emerald-400 text-black'
            }`}
          >
            {user?.name?.charAt(0) ?? 'A'}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl font-bold text-white">{user?.name}</h2>
              <StatusBadge persona={user?.persona ?? 'USER'} />
            </div>
            <p className="text-sm text-slate-400 mt-1 font-mono">{user?.email}</p>
            <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-500" /> {user?.merchantName}
              </span>
              <span className="flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-slate-500" /> {user?.department}
              </span>
            </div>
            <div className="mt-1.5">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                Role: <span className={isMaintainer ? 'text-purple-400' : 'text-emerald-400'}>{user?.role?.replace(/_/g, ' ')}</span>
              </span>
              {user?.lastLogin && (
                <span className="ml-4 text-[10px] font-mono text-slate-500">
                  Last login: {new Date(user.lastLogin).toLocaleString('en-IN')}
                </span>
              )}
            </div>
          </div>

          {/* Persona Switch */}
          <div className="flex-shrink-0 flex flex-col gap-2 items-end">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Active Persona</span>
            <div className="flex items-center gap-2 p-1 rounded-xl bg-background-surface border border-background-border">
              <button
                onClick={() => handlePersonaSwitch('USER')}
                disabled={switchingPersona}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  !isMaintainer
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" /> User
              </button>
              <button
                onClick={() => handlePersonaSwitch('MAINTAINER')}
                disabled={switchingPersona}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  isMaintainer
                    ? 'bg-purple-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Wrench className="w-3.5 h-3.5" /> Maintainer
              </button>
            </div>
            {switchingPersona && (
              <span className="text-[10px] text-slate-400 font-mono animate-pulse">Switching persona…</span>
            )}
          </div>
        </div>

        {/* Maintainer Warning Banner */}
        <AnimatePresence>
          {isMaintainer && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-3 bg-purple-950/40 border border-purple-700/40 rounded-xl flex items-center gap-3 text-xs text-purple-300"
            >
              <AlertTriangle className="w-4 h-4 text-purple-400 shrink-0" />
              <span>
                <strong>Maintainer Mode Active.</strong> You have elevated system access — AI model config,
                circuit breakers, and infrastructure controls are visible. Changes take effect immediately.
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tabs + Content */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Tab List */}
        <div className="lg:w-52 shrink-0">
          <nav className="glass-card p-2 space-y-1">
            {visibleTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors text-left ${
                  activeTab === tab.id
                    ? isMaintainer
                      ? 'bg-purple-900/50 text-purple-300 border border-purple-700/40'
                      : 'bg-emerald-900/50 text-emerald-300 border border-emerald-700/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-background-surface'
                }`}
              >
                <tab.icon className="w-4 h-4 shrink-0" />
                {tab.label}
                {activeTab === tab.id && <ChevronRight className="w-3 h-3 ml-auto" />}
              </button>
            ))}
          </nav>

          {/* Quick Stats */}
          <div className="glass-card p-4 mt-4 space-y-3">
            <span className="text-[10px] font-mono uppercase text-slate-500 tracking-widest block">Session Stats</span>
            {[
              { label: 'Decisions Today', value: '24', icon: Activity },
              { label: 'Recovery Rate', value: '87.4%', icon: BarChart3 },
              { label: 'AI Confidence', value: `${prefs.aiConfidenceThreshold}%`, icon: Zap },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <Icon className="w-3 h-3 text-slate-500" /> {label}
                </span>
                <span className="text-xs font-bold text-white font-mono">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tab Content Panel */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div key="overview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
                <div className="glass-card p-6 space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <User className="w-4 h-4 text-emerald-400" /> Personal Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Full Name" value={name} onChange={setName} icon={User} />
                    <Field label="Mobile Phone" value={phone} onChange={setPhone} icon={Phone} type="tel" />
                    <Field label="Work Email" value={user?.email ?? ''} icon={Mail} disabled />
                    <Field label="Organization" value={merchantName} onChange={setMerchantName} icon={Building2} />
                    <Field label="Department" value={department} onChange={setDepartment} icon={Briefcase} className="sm:col-span-2" />
                  </div>
                </div>

                <div className="glass-card p-6 space-y-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Info className="w-4 h-4 text-slate-400" /> Account Details
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Persona', value: user?.persona ?? '—' },
                      { label: 'Role', value: user?.role?.replace(/_/g, ' ') ?? '—' },
                      { label: 'Account ID', value: user?.id ? `#${user.id.slice(-8).toUpperCase()}` : 'DEMO-8291' },
                      { label: 'Member Since', value: '2024-Q2' },
                    ].map(({ label, value }) => (
                      <div key={label} className="p-3 rounded-lg bg-background-surface border border-background-border">
                        <span className="text-[10px] font-mono text-slate-500 uppercase">{label}</span>
                        <div className="text-sm font-bold text-white mt-0.5 font-mono">{value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'preferences' && (
              <motion.div key="prefs" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
                <div className="glass-card p-6 space-y-5">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Bell className="w-4 h-4 text-emerald-400" /> Notification & Alert Preferences
                  </h3>

                  {[
                    { key: 'autoRetryNotifications' as const, label: 'Auto-Retry Notifications', desc: 'Notify when RecoverAI autonomously retries a failed transaction' },
                    { key: 'escalationAlerts' as const, label: 'Escalation Alerts', desc: 'High-risk cases requiring human review' },
                    { key: 'smsAlerts' as const, label: 'SMS Alerts', desc: 'Receive critical alerts via SMS to your registered mobile' },
                  ].map(({ key, label, desc }) => (
                    <div key={key} className="flex items-start justify-between gap-4 py-3 border-b border-background-border last:border-0">
                      <div>
                        <p className="text-sm font-semibold text-white">{label}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
                      </div>
                      <Toggle checked={prefs[key]} onChange={(v) => setPrefs((p) => ({ ...p, [key]: v }))} />
                    </div>
                  ))}

                  <div className="pt-2">
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">Email Report Frequency</label>
                    <div className="flex gap-2">
                      {(['REALTIME', 'DAILY', 'WEEKLY'] as const).map((freq) => (
                        <button
                          key={freq}
                          onClick={() => setPrefs((p) => ({ ...p, emailReports: freq }))}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                            prefs.emailReports === freq
                              ? 'bg-emerald-900/60 border-emerald-500 text-emerald-300'
                              : 'bg-background-surface border-background-border text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {freq}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      AI Confidence Threshold: <span className="text-emerald-400 font-mono">{prefs.aiConfidenceThreshold}%</span>
                    </label>
                    <p className="text-[11px] text-slate-500 mb-2">Agent will only auto-execute recovery decisions above this confidence level</p>
                    <input
                      type="range"
                      min={50}
                      max={99}
                      value={prefs.aiConfidenceThreshold}
                      onChange={(e) => setPrefs((p) => ({ ...p, aiConfidenceThreshold: +e.target.value }))}
                      className="w-full accent-emerald-500"
                    />
                    <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-0.5">
                      <span>50% — Aggressive</span><span>99% — Conservative</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-2">
                      <Globe className="w-3.5 h-3.5 text-slate-500" /> Webhook URL
                    </label>
                    <input
                      type="url"
                      value={prefs.webhookUrl}
                      onChange={(e) => setPrefs((p) => ({ ...p, webhookUrl: e.target.value }))}
                      className="w-full bg-background-surface border border-background-border rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'payout' && (
              <motion.div key="payout" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                <div className="glass-card p-6 space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-emerald-400" /> Payout & Settlement Account
                  </h3>
                  <div className="p-4 rounded-xl bg-gradient-to-tr from-slate-900 to-slate-800 border border-background-border">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Primary Settlement Account</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-300">VERIFIED</span>
                    </div>
                    <div className="text-2xl font-black text-white font-mono tracking-widest mb-1">{payout.accountNumber}</div>
                    <div className="text-xs text-slate-400">{payout.bankName} · {payout.ifscCode}</div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <Field label="Bank Name" value={payout.bankName} onChange={(v) => setPayout((p) => ({ ...p, bankName: v }))} icon={Building2} />
                    <Field label="IFSC Code" value={payout.ifscCode} onChange={(v) => setPayout((p) => ({ ...p, ifscCode: v }))} icon={Settings} />
                    <Field
                      label="Account Number"
                      value={payout.accountNumber}
                      onChange={(v) => setPayout((p) => ({ ...p, accountNumber: v }))}
                      icon={CreditCard}
                      className="sm:col-span-2"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-700/30 flex items-start gap-2 text-xs text-amber-300">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>Changes to payout details require re-verification. Demo data is simulated — no real bank accounts are linked.</span>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'maintainer' && isMaintainer && (
              <motion.div key="maintainer" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
                {/* AI Engine Config */}
                <div className="glass-card p-6 space-y-4 border border-purple-900/40">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-purple-400" /> AI Engine Configuration
                  </h3>
                  <Field
                    label="AI Model Pipeline"
                    value={mSettings.aiModel}
                    onChange={(v) => setMSettings((m) => ({ ...m, aiModel: v }))}
                    icon={Zap}
                  />

                  <div className="flex items-start justify-between gap-4 py-3 border-b border-background-border">
                    <div>
                      <p className="text-sm font-semibold text-white">Circuit Breaker</p>
                      <p className="text-xs text-slate-400 mt-0.5">Emergency stop — disables AI autonomous execution immediately across all retry queues</p>
                    </div>
                    <Toggle
                      checked={mSettings.circuitBreakerActive}
                      onChange={(v) => setMSettings((m) => ({ ...m, circuitBreakerActive: v }))}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">Telemetry Level</label>
                    <div className="flex gap-2">
                      {(['DEBUG', 'INFO', 'WARN'] as const).map((lvl) => (
                        <button
                          key={lvl}
                          onClick={() => setMSettings((m) => ({ ...m, telemetryLevel: lvl }))}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                            mSettings.telemetryLevel === lvl
                              ? 'bg-purple-900/60 border-purple-500 text-purple-300'
                              : 'bg-background-surface border-background-border text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Infrastructure Controls */}
                <div className="glass-card p-6 space-y-4 border border-purple-900/40">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Settings className="w-4 h-4 text-purple-400" /> Infrastructure Controls
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">
                        Log Retention: <span className="text-purple-400 font-mono">{mSettings.logRetentionDays} days</span>
                      </label>
                      <input
                        type="range"
                        min={7}
                        max={365}
                        step={7}
                        value={mSettings.logRetentionDays}
                        onChange={(e) => setMSettings((m) => ({ ...m, logRetentionDays: +e.target.value }))}
                        className="w-full accent-purple-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">
                        Worker Nodes: <span className="text-purple-400 font-mono">{mSettings.workerNodes}</span>
                      </label>
                      <input
                        type="range"
                        min={1}
                        max={16}
                        value={mSettings.workerNodes}
                        onChange={(e) => setMSettings((m) => ({ ...m, workerNodes: +e.target.value }))}
                        className="w-full accent-purple-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    {[
                      { label: 'Database', value: 'MongoDB 7.0', status: 'ONLINE' },
                      { label: 'AI Service', value: 'Gemini / Fallback', status: 'ONLINE' },
                      { label: 'Audit Ledger', value: 'Immutable', status: 'SEALED' },
                      { label: 'Policy Engine', value: '5 Active Rules', status: 'ENFORCED' },
                    ].map(({ label, value, status }) => (
                      <div key={label} className="p-3 rounded-lg bg-background-surface border border-background-border">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-mono text-slate-500 uppercase">{label}</span>
                          <span className="text-[9px] font-mono font-bold text-purple-400 bg-purple-950/50 px-1.5 py-0.5 rounded">{status}</span>
                        </div>
                        <div className="text-xs font-bold text-white">{value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div key="security" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
                {/* Security Overview */}
                <div className="glass-card p-6 space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" /> Security & Access Configuration
                  </h3>

                  {[
                    { label: 'Authentication Method', value: 'Password + OTP Multi-Factor', badge: 'ACTIVE' },
                    { label: 'Session Encryption', value: 'HMAC-SHA256 Signed JWT Token', badge: 'ENCRYPTED' },
                    { label: 'Password Encryption', value: 'Bcrypt Hash with Salt Rounds', badge: 'SECURED' },
                    { label: 'Brute-Force Guard', value: '5 bad attempts -> 15m Auto-Lock', badge: 'ENFORCED' },
                    { label: 'Financial Guardrails', value: 'BOUNDED — Max ₹50,000 / 3 Retries Max', badge: 'ENFORCED' },
                  ].map(({ label, value, badge }) => (
                    <div key={label} className="flex items-center justify-between py-3 border-b border-background-border last:border-0">
                      <div>
                        <p className="text-sm font-semibold text-white">{label}</p>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">{value}</p>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded">
                        {badge}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Change Password Card */}
                <div className="glass-card p-6 space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Lock className="w-4 h-4 text-purple-400" /> Change / Update Account Password
                  </h3>

                  {passwordMsg && (
                    <div
                      className={`p-3 rounded-xl text-xs font-medium border flex items-center gap-2 ${
                        passwordMsg.type === 'success'
                          ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300'
                          : 'bg-red-950/60 border-red-500/60 text-red-300'
                      }`}
                    >
                      {passwordMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
                      <span>{passwordMsg.text}</span>
                    </div>
                  )}

                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      setPasswordMsg(null);
                      if (!newPassword || newPassword.length < 6) {
                        setPasswordMsg({ type: 'error', text: 'New password must be at least 6 characters.' });
                        return;
                      }
                      if (newPassword !== confirmPassword) {
                        setPasswordMsg({ type: 'error', text: 'New passwords do not match.' });
                        return;
                      }
                      setPasswordLoading(true);
                      try {
                        const res = await api.changePassword({
                          email: user?.email || '',
                          currentPassword,
                          newPassword,
                        });
                        if (res.success) {
                          setPasswordMsg({ type: 'success', text: 'Password updated successfully!' });
                          setCurrentPassword('');
                          setNewPassword('');
                          setConfirmPassword('');
                        } else {
                          setPasswordMsg({ type: 'error', text: res.message || 'Failed to update password.' });
                        }
                      } catch (err: any) {
                        setPasswordMsg({ type: 'error', text: err?.response?.data?.error || 'Failed to update password.' });
                      } finally {
                        setPasswordLoading(false);
                      }
                    }}
                    className="space-y-3 pt-1"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1">Current Password</label>
                        <input
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Current password"
                          className="w-full bg-background-surface border border-background-border rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1">New Password</label>
                        <input
                          type="password"
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Min 6 chars"
                          className="w-full bg-background-surface border border-background-border rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1">Confirm New</label>
                        <input
                          type="password"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Repeat new password"
                          className="w-full bg-background-surface border border-background-border rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        disabled={passwordLoading}
                        className="btn-primary text-xs py-2 px-4 flex items-center gap-2"
                      >
                        {passwordLoading ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Updating...
                          </>
                        ) : (
                          <>
                            <Lock className="w-3.5 h-3.5" /> Update Password
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Floating Save for mobile */}
      <div className="flex justify-end pt-2">
        <SaveButton onClick={handleSave} saved={saved} />
      </div>
    </div>
  );
};

// Reusable labeled field
function Field({
  label,
  value,
  onChange,
  icon: Icon,
  type = 'text',
  disabled = false,
  className = '',
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  icon: React.ElementType;
  type?: string;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="text-xs font-semibold text-slate-300 block mb-1.5">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
        <input
          type={type}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled}
          className="w-full bg-background-surface border border-background-border rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>
    </div>
  );
}
