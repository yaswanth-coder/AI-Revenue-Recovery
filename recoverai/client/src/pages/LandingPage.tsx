import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Zap,
  ArrowRight,
  ShieldCheck,
  Cpu,
  BarChart3,
  CheckCircle2,
  Lock,
  RotateCcw,
  Sparkles,
  TrendingUp,
  Activity,
  Layers,
} from 'lucide-react';
import { DemoBanner } from '../components/DemoBanner';
import { RevenueRecoveryNetwork } from '../three/RevenueRecoveryNetwork';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const workflowSteps = [
    { num: '01', title: 'Detect', desc: 'Real-time payment webhook failure ingestion', color: 'text-red-400' },
    { num: '02', title: 'Diagnose', desc: 'Root cause classification via AI & telemetry', color: 'text-purple-400' },
    { num: '03', title: 'Decide', desc: 'Predictive recovery probability & action recommendation', color: 'text-emerald-400' },
    { num: '04', title: 'Guard', desc: 'Deterministic policy engine hard constraints', color: 'text-cyan-400' },
    { num: '05', title: 'Recover', desc: 'Bounded execution: optimal retries & smart routing', color: 'text-emerald-400' },
    { num: '06', title: 'Verify', desc: 'Outcome confirmation & balance reconciliation', color: 'text-teal-400' },
    { num: '07', title: 'Audit', desc: 'Tamper-evident audit logging for every decision', color: 'text-slate-400' },
  ];

  return (
    <div className="min-h-screen bg-background text-slate-100 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-200">
      <DemoBanner />

      {/* Navigation Header */}
      <header className="h-20 border-b border-background-border/80 px-6 max-w-7xl w-full mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-black font-black shadow-glow-sm">
            <Zap className="w-5 h-5 fill-black text-black" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight text-white flex items-center gap-1">
              Recover<span className="text-emerald-400">AI</span>
            </span>
            <span className="text-[9px] uppercase tracking-widest font-mono text-emerald-500/80 -mt-1 block font-semibold">
              Autonomous Revenue Recovery
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/simulator')}
            className="btn-secondary text-xs py-2 px-4 hidden sm:flex"
          >
            Live Simulator
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-primary text-xs py-2 px-4"
          >
            Enter Control Center <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 sm:py-20 px-6 max-w-7xl w-full mx-auto flex-1 flex flex-col justify-center">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-xs font-mono text-emerald-300"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>AUTONOMOUS FINTECH RECOVERY PLATFORM</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight font-sans text-white leading-tight"
          >
            Recover Revenue.{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-emerald-300 to-teal-400 bg-clip-text text-transparent">
              Intelligently.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal"
          >
            RecoverAI autonomously detects payment failures, determines bounded recovery actions,
            verifies outcomes, and turns lost revenue into measurable recovery — protected by a
            deterministic policy engine.
          </motion.p>

          {/* Action CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <button
              onClick={() => navigate('/dashboard')}
              className="btn-primary text-sm py-3.5 px-8 w-full sm:w-auto shadow-glow-md"
            >
              Enter Control Center <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/simulator')}
              className="btn-secondary text-sm py-3.5 px-8 w-full sm:w-auto"
            >
              <Activity className="w-4 h-4 text-emerald-400" />
              Run Live Simulation
            </button>
          </motion.div>
        </div>

        {/* 3D Network Centerpiece */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-12 sm:mt-16 w-full"
        >
          <RevenueRecoveryNetwork />
        </motion.div>
      </section>

      {/* How It Works Workflow Bar */}
      <section className="border-y border-background-border/80 bg-background-secondary/60 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-400">
              Deterministic Autonomous Loop
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
              How RecoverAI Recovers Lost Revenue
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {workflowSteps.map((step, idx) => (
              <div
                key={step.num}
                className="glass-card p-4 border-background-border relative overflow-hidden group hover:border-emerald-500/40 transition-colors"
              >
                <span className="text-[10px] font-mono text-slate-500 font-bold">
                  STAGE {step.num}
                </span>
                <h3 className={`text-base font-bold mt-1 ${step.color}`}>
                  {step.title}
                </h3>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                  {step.desc}
                </p>
                {idx < workflowSteps.length - 1 && (
                  <div className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 text-slate-600">
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Three Pillars Section */}
      <section className="py-16 px-6 max-w-7xl w-full mx-auto">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Pillar 1 */}
          <div className="glass-card p-6 border-emerald-900/40 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Recover More</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Identify revenue at risk automatically across UPI, cards, and net banking.
              Predict recovery probabilities and apply optimal retry sequences.
            </p>
            <div className="pt-2 text-xs font-mono text-emerald-400 flex items-center gap-1">
              <span>70.1% Average Recovery Rate</span>
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="glass-card p-6 border-emerald-900/40 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Act Safely</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              AI decisions are strictly constrained by a deterministic Policy Engine.
              High-risk scores (&gt;70) and amounts (&gt;₹50,000) are automatically escalated to humans.
            </p>
            <div className="pt-2 text-xs font-mono text-cyan-400 flex items-center gap-1">
              <span>Bounded Autonomy Guaranteed</span>
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="glass-card p-6 border-emerald-900/40 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Prove Impact</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Complete tamper-evident audit logging for every single decision, policy validation,
              and verified simulation with exact rupee amounts.
            </p>
            <div className="pt-2 text-xs font-mono text-purple-400 flex items-center gap-1">
              <span>100% Auditable Ledger</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-background-border py-8 px-6 text-center text-xs text-slate-500 font-mono">
        <p>RecoverAI • Autonomous AI Revenue Recovery Platform • Demo Environment</p>
      </footer>
    </div>
  );
};
