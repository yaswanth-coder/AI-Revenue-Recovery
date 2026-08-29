import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Play,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  Bot,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Cpu,
  Receipt,
  Check,
  X,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { api, formatINR } from '../services/api';
import { RiskGauge } from '../components/RiskGauge';
import { StatusBadge } from '../components/StatusBadge';
import { SimulationResponse, SimulationStep } from '../types';

export const Simulator: React.FC = () => {
  const navigate = useNavigate();

  // Form State
  const [amount, setAmount] = useState<number>(2499);
  const [paymentMethod, setPaymentMethod] = useState<string>('UPI');
  const [failureReason, setFailureReason] = useState<string>('BANK_TIMEOUT');
  const [previousFailures, setPreviousFailures] = useState<number>(0);
  const [customerHistory, setCustomerHistory] = useState<string>('EXCELLENT');
  const [transactionAgeMinutes, setTransactionAgeMinutes] = useState<number>(5);

  // Execution State
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  const [simulationResult, setSimulationResult] = useState<SimulationResponse | null>(null);

  // Pre-set Scenarios
  const loadScenario1 = () => {
    setAmount(2499);
    setPaymentMethod('UPI');
    setFailureReason('BANK_TIMEOUT');
    setPreviousFailures(0);
    setCustomerHistory('EXCELLENT');
    setTransactionAgeMinutes(5);
    setSimulationResult(null);
    setCurrentStepIndex(-1);
  };

  const loadScenario2 = () => {
    setAmount(25000);
    setPaymentMethod('CREDIT_CARD');
    setFailureReason('CARD_DECLINED');
    setPreviousFailures(5);
    setCustomerHistory('POOR');
    setTransactionAgeMinutes(120);
    setSimulationResult(null);
    setCurrentStepIndex(-1);
  };

  const loadScenario3HighValue = () => {
    setAmount(75000);
    setPaymentMethod('NET_BANKING');
    setFailureReason('BANK_TIMEOUT');
    setPreviousFailures(1);
    setCustomerHistory('GOOD');
    setTransactionAgeMinutes(15);
    setSimulationResult(null);
    setCurrentStepIndex(-1);
  };

  const runAgent = async () => {
    setIsRunning(true);
    setSimulationResult(null);
    setCurrentStepIndex(0);

    try {
      // Step animation sequence
      const stepInterval = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev < 7) return prev + 1;
          clearInterval(stepInterval);
          return prev;
        });
      }, 400);

      const response = await api.runSimulation({
        amount: Number(amount),
        paymentMethod,
        failureReason,
        previousFailures: Number(previousFailures),
        customerHistory,
        transactionAgeMinutes: Number(transactionAgeMinutes),
      });

      clearInterval(stepInterval);
      setCurrentStepIndex(7);
      setSimulationResult(response);

      // Trigger celebratory confetti if revenue was successfully recovered
      if (response.recoveredAmount > 0) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#34d399', '#059669', '#38bdf8'],
        });
      }
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setIsRunning(false);
    }
  };

  const flowSteps = [
    { key: 'DETECT', title: '01 DETECT', desc: 'Ingesting failure webhook' },
    { key: 'DIAGNOSE', title: '02 DIAGNOSE', desc: 'Classifying failure root cause' },
    { key: 'RISK_ASSESSMENT', title: '03 RISK ASSESSMENT', desc: '0-100 deterministic risk scoring' },
    { key: 'POLICY_VALIDATION', title: '04 POLICY VALIDATION', desc: 'Deterministic guardrails check' },
    { key: 'DECISION', title: '05 DECISION', desc: 'AI action recommendation' },
    { key: 'EXECUTION', title: '06 EXECUTION', desc: 'Simulated payment gateway attempt' },
    { key: 'VERIFICATION', title: '07 VERIFICATION', desc: 'Cryptographic result verification' },
    { key: 'AUDIT', title: '08 AUDIT', desc: 'Immutable audit log recorded' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
              Autonomous Recovery Simulator
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Interactive
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Test end-to-end payment failure detection, risk calculation, policy enforcement, and verified execution.
          </p>
        </div>

        {/* Quick Scenario Preset Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 mr-1">Demo Scenarios:</span>
          <button
            onClick={loadScenario1}
            className="px-3 py-1.5 rounded-lg text-xs font-mono font-semibold bg-emerald-950/40 text-emerald-300 border border-emerald-800/60 hover:bg-emerald-900/60 transition-colors"
          >
            Scenario 1: ₹2,499 (Success)
          </button>
          <button
            onClick={loadScenario2}
            className="px-3 py-1.5 rounded-lg text-xs font-mono font-semibold bg-red-950/40 text-red-300 border border-red-800/60 hover:bg-red-900/60 transition-colors"
          >
            Scenario 2: ₹25k (Blocked)
          </button>
          <button
            onClick={loadScenario3HighValue}
            className="px-3 py-1.5 rounded-lg text-xs font-mono font-semibold bg-purple-950/40 text-purple-300 border border-purple-800/60 hover:bg-purple-900/60 transition-colors"
          >
            Scenario 3: ₹75k (High Value)
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Form: Input Controls */}
        <div className="lg:col-span-5 glass-card p-6 border-emerald-900/40 space-y-5">
          <div className="flex items-center justify-between border-b border-background-border pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-400" />
              Simulated Transaction Parameters
            </h3>
            <span className="text-[10px] font-mono text-emerald-400">Synthetic Input</span>
          </div>

          <div className="space-y-4">
            {/* Amount */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Transaction Amount (INR ₹)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                  ₹
                </span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full bg-background-surface border border-background-border rounded-xl pl-8 pr-4 py-2.5 text-sm font-mono font-bold text-white focus:outline-none focus:border-emerald-500"
                  min={1}
                />
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-background-surface border border-background-border rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="UPI">UPI (Google Pay, PhonePe, Paytm)</option>
                <option value="CREDIT_CARD">Credit Card (Visa / Mastercard)</option>
                <option value="DEBIT_CARD">Debit Card</option>
                <option value="NET_BANKING">Net Banking</option>
                <option value="WALLET">Digital Wallet</option>
              </select>
            </div>

            {/* Failure Reason */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Failure Reason
              </label>
              <select
                value={failureReason}
                onChange={(e) => setFailureReason(e.target.value)}
                className="w-full bg-background-surface border border-background-border rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="BANK_TIMEOUT">BANK_TIMEOUT (Temporary bank timeout)</option>
                <option value="CARD_DECLINED">CARD_DECLINED (Card issuer declined)</option>
                <option value="INSUFFICIENT_FUNDS">INSUFFICIENT_FUNDS (Account balance low)</option>
                <option value="NETWORK_ERROR">NETWORK_ERROR (Network connectivity dropped)</option>
                <option value="AUTHENTICATION_FAILURE">AUTHENTICATION_FAILURE (3DS / OTP failed)</option>
                <option value="EXPIRED_CARD">EXPIRED_CARD (Card validity expired)</option>
                <option value="LIMIT_EXCEEDED">LIMIT_EXCEEDED (Card limit exceeded)</option>
                <option value="UNKNOWN_ERROR">UNKNOWN_ERROR (Unclassified error)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Previous Failures */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Previous Failures
                </label>
                <input
                  type="number"
                  value={previousFailures}
                  onChange={(e) => setPreviousFailures(Number(e.target.value))}
                  min={0}
                  max={10}
                  className="w-full bg-background-surface border border-background-border rounded-xl px-3 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Customer History */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Customer History
                </label>
                <select
                  value={customerHistory}
                  onChange={(e) => setCustomerHistory(e.target.value)}
                  className="w-full bg-background-surface border border-background-border rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="EXCELLENT">EXCELLENT (0 failures historically)</option>
                  <option value="GOOD">GOOD (High success rate)</option>
                  <option value="FAIR">FAIR (Occasional failures)</option>
                  <option value="POOR">POOR (Frequent chargebacks/fails)</option>
                  <option value="NEW">NEW (First time customer)</option>
                </select>
              </div>
            </div>

            {/* Transaction Age */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Failure Age (Minutes ago)
              </label>
              <input
                type="number"
                value={transactionAgeMinutes}
                onChange={(e) => setTransactionAgeMinutes(Number(e.target.value))}
                min={1}
                max={2880}
                className="w-full bg-background-surface border border-background-border rounded-xl px-3 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Trigger Button */}
          <button
            onClick={runAgent}
            disabled={isRunning}
            className={`w-full py-4 text-sm font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 ${
              isRunning
                ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                : 'btn-primary shadow-glow-md'
            }`}
          >
            <Play className={`w-4 h-4 ${isRunning ? 'animate-spin' : 'fill-white'}`} />
            {isRunning ? 'AGENT EVALUATING...' : 'RUN RECOVERY AGENT'}
          </button>
        </div>

        {/* Right Output: 8-Step Pipeline & Result Card */}
        <div className="lg:col-span-7 space-y-6">
          {/* Animated 8-Step Progress Pipeline */}
          <div className="glass-card p-6 border-emerald-900/40">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center justify-between">
              <span>Autonomous Decision Pipeline</span>
              <span className="text-[10px] font-mono text-slate-400">
                {currentStepIndex >= 0 ? `Stage ${currentStepIndex + 1} of 8` : 'Ready'}
              </span>
            </h3>

            <div className="space-y-2">
              {flowSteps.map((step, idx) => {
                const isCurrent = currentStepIndex === idx;
                const isPassed = currentStepIndex > idx;
                const isPending = currentStepIndex < idx;

                const stepData = simulationResult?.steps?.[idx];
                const isBlocked = stepData?.status === 'BLOCKED';
                const isEscalated = stepData?.status === 'ESCALATED';

                return (
                  <motion.div
                    key={step.key}
                    initial={false}
                    animate={{
                      backgroundColor: isCurrent
                        ? 'rgba(16, 185, 129, 0.1)'
                        : isPassed
                        ? 'rgba(17, 27, 21, 0.6)'
                        : 'rgba(8, 14, 11, 0.4)',
                    }}
                    className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                      isCurrent
                        ? 'border-emerald-500/70 shadow-glow-sm'
                        : isPassed
                        ? isBlocked
                          ? 'border-red-800/40 bg-red-950/20'
                          : isEscalated
                          ? 'border-amber-800/40 bg-amber-950/20'
                          : 'border-emerald-900/40'
                        : 'border-background-border opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold shrink-0 ${
                          isPassed
                            ? isBlocked
                              ? 'bg-red-500 text-white'
                              : isEscalated
                              ? 'bg-amber-500 text-black'
                              : 'bg-emerald-500 text-black'
                            : isCurrent
                            ? 'bg-emerald-400 text-black animate-pulse'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {isPassed ? (
                          isBlocked ? <X className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />
                        ) : (
                          idx + 1
                        )}
                      </div>
                      <div>
                        <span
                          className={`text-xs font-bold uppercase tracking-wider ${
                            isCurrent
                              ? 'text-emerald-300'
                              : isPassed
                              ? 'text-slate-200'
                              : 'text-slate-400'
                          }`}
                        >
                          {step.title}
                        </span>
                        <p className="text-[11px] text-slate-400">
                          {stepData?.detail || step.desc}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isCurrent && (
                        <span className="text-[10px] font-mono font-bold text-emerald-400 animate-pulse">
                          PROCESSING...
                        </span>
                      )}
                      {isPassed && stepData && (
                        <StatusBadge status={stepData.status} size="sm" />
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Outcome & Decision Summary Card */}
          <AnimatePresence>
            {simulationResult && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className={`glass-card p-6 border-2 ${
                  simulationResult.recoveredAmount > 0
                    ? 'border-emerald-500/80 bg-emerald-950/30'
                    : simulationResult.decision.policyEvaluation.result === 'BLOCKED'
                    ? 'border-red-500/80 bg-red-950/30'
                    : 'border-amber-500/80 bg-amber-950/30'
                }`}
              >
                {/* Result Header Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-background-border pb-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold">
                      Simulation Result • Ref: {simulationResult.simulationId}
                    </span>
                    <h2
                      className={`text-3xl font-extrabold font-mono mt-1 ${
                        simulationResult.recoveredAmount > 0
                          ? 'text-emerald-400'
                          : 'text-slate-200'
                      }`}
                    >
                      {simulationResult.recoveredAmount > 0
                        ? `${formatINR(simulationResult.recoveredAmount)} RECOVERED`
                        : simulationResult.decision.finalAction === 'ESCALATE'
                        ? 'HUMAN ESCALATION REQUIRED'
                        : 'ACTION BLOCKED BY POLICY'}
                    </h2>
                  </div>

                  <div className="flex items-center gap-2">
                    <StatusBadge
                      status={
                        simulationResult.recoveredAmount > 0
                          ? 'RECOVERED'
                          : simulationResult.decision.finalAction
                      }
                      size="lg"
                    />
                  </div>
                </div>

                {/* Structured Decision Factors */}
                <div className="mt-5 grid sm:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Risk Engine Assessment
                    </h4>
                    <RiskGauge
                      score={simulationResult.decision.riskResult.score}
                      size="md"
                    />
                    <div className="mt-3 text-xs space-y-1 font-mono text-slate-300">
                      <div>
                        Recovery Probability:{' '}
                        <strong className="text-emerald-400">
                          {simulationResult.decision.riskResult.recoveryProbability}%
                        </strong>
                      </div>
                      <div>
                        AI Recommendation:{' '}
                        <strong className="text-purple-400">
                          {simulationResult.decision.aiRecommendedAction}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Policy Engine Guardrail
                    </h4>
                    <div className="p-3 rounded-lg bg-background-surface/80 border border-background-border text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Policy Verdict:</span>
                        <StatusBadge
                          status={simulationResult.decision.policyEvaluation.result}
                          size="sm"
                        />
                      </div>
                      <div className="text-[11px] text-slate-300 leading-relaxed pt-1 border-t border-background-border">
                        {simulationResult.decision.policyEvaluation.reason}
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Business Reasoning Explanation */}
                <div className="mt-4 p-3.5 rounded-xl bg-background-surface/80 border border-emerald-900/40 text-xs leading-relaxed">
                  <div className="flex items-center gap-1.5 font-semibold text-emerald-400 mb-1">
                    <Bot className="w-4 h-4" />
                    <span>Agent Explanation</span>
                    {simulationResult.aiUsed ? (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-mono">
                        LLM GENERATED
                      </span>
                    ) : (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                        DETERMINISTIC REASONING
                      </span>
                    )}
                  </div>
                  <p className="text-slate-300">{simulationResult.explanation}</p>
                </div>

                {/* Action Footer */}
                <div className="mt-5 flex items-center justify-between pt-3 border-t border-background-border">
                  <span className="text-[11px] text-slate-400 font-mono">
                    All actions recorded to immutable audit ledger
                  </span>
                  <button
                    onClick={() => navigate('/audit')}
                    className="btn-secondary text-xs py-1.5 px-3"
                  >
                    View Audit Trail <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
