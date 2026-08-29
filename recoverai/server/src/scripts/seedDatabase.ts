import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

import Transaction from '../models/Transaction';
import Customer from '../models/Customer';
import RecoveryCase from '../models/RecoveryCase';
import AgentDecision from '../models/AgentDecision';
import AuditLog from '../models/AuditLog';
import Policy from '../models/Policy';
import { calculateRisk } from '../services/riskEngine';
import { determineFallbackAction } from '../services/recoveryDecisionService';
import {
  FailureReason, PaymentMethod, CustomerHistory,
  RecoveryAction, RecoveryStatus
} from '../types';

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/recoverai';

// ─── Realistic distributions ──────────────────────────────────────────────────

const FAILURE_REASONS: { reason: FailureReason; weight: number }[] = [
  { reason: 'BANK_TIMEOUT', weight: 40 },
  { reason: 'CARD_DECLINED', weight: 15 },
  { reason: 'INSUFFICIENT_FUNDS', weight: 12 },
  { reason: 'NETWORK_ERROR', weight: 10 },
  { reason: 'AUTHENTICATION_FAILURE', weight: 8 },
  { reason: 'EXPIRED_CARD', weight: 7 },
  { reason: 'LIMIT_EXCEEDED', weight: 5 },
  { reason: 'UNKNOWN_ERROR', weight: 3 },
];

const PAYMENT_METHODS: { method: PaymentMethod; weight: number }[] = [
  { method: 'UPI', weight: 40 },
  { method: 'DEBIT_CARD', weight: 25 },
  { method: 'CREDIT_CARD', weight: 20 },
  { method: 'NET_BANKING', weight: 10 },
  { method: 'WALLET', weight: 5 },
];

const CUSTOMER_HISTORIES: { history: CustomerHistory; weight: number }[] = [
  { history: 'EXCELLENT', weight: 20 },
  { history: 'GOOD', weight: 40 },
  { history: 'FAIR', weight: 25 },
  { history: 'POOR', weight: 10 },
  { history: 'NEW', weight: 5 },
];

const FIRST_NAMES = ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan',
  'Krishna', 'Ishaan', 'Priya', 'Ananya', 'Isha', 'Kavya', 'Pooja', 'Neha', 'Riya', 'Shreya',
  'Ananya', 'Divya', 'Rohan', 'Karan', 'Vikram', 'Rahul', 'Nikhil', 'Akash', 'Amit', 'Saurabh'];
const LAST_NAMES = ['Sharma', 'Patel', 'Singh', 'Mehta', 'Gupta', 'Verma', 'Joshi', 'Nair',
  'Reddy', 'Kumar', 'Agarwal', 'Shah', 'Malhotra', 'Kapoor', 'Iyer', 'Rao', 'Bose', 'Chatterjee'];

function weightedRandom<T>(items: { weight: number }[]): T {
  const total = items.reduce((s, i) => s + i.weight, 0);
  let r = Math.random() * total;
  for (const item of items) {
    r -= item.weight;
    if (r <= 0) return item as unknown as T;
  }
  return items[items.length - 1] as unknown as T;
}

function randomAmount(): number {
  const r = Math.random();
  if (r < 0.20) return Math.floor(100 + Math.random() * 400);          // < ₹500
  if (r < 0.60) return Math.floor(500 + Math.random() * 4500);         // ₹500-5000
  if (r < 0.90) return Math.floor(5000 + Math.random() * 45000);       // ₹5000-50000
  return Math.floor(50001 + Math.random() * 200000);                    // > ₹50000
}

function randomDate(daysBack: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * daysBack));
  d.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
  return d;
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Recovery success rates per scenario
const RECOVERY_SUCCESS_BY_RISK: Record<string, number> = {
  LOW: 0.72,
  MEDIUM: 0.42,
  HIGH: 0.08,
};

// ─── Default Policies ─────────────────────────────────────────────────────────

const DEFAULT_POLICIES = [
  {
    policyId: 'POL_001',
    name: 'Automatic Retry Limit',
    description: 'Maximum number of automatic retry attempts before escalation.',
    key: 'MAX_AUTO_RETRIES',
    value: 1,
    type: 'number' as const,
    enabled: true,
    category: 'Recovery',
  },
  {
    policyId: 'POL_002',
    name: 'High-Value Transaction Threshold',
    description: 'Transactions above this amount require human approval for recovery.',
    key: 'HIGH_VALUE_THRESHOLD',
    value: 50000,
    type: 'number' as const,
    enabled: true,
    category: 'Authorization',
  },
  {
    policyId: 'POL_003',
    name: 'Maximum Failures Before Escalation',
    description: 'Number of failures before a transaction is automatically escalated to human review.',
    key: 'MAX_FAILURES_BEFORE_ESCALATION',
    value: 3,
    type: 'number' as const,
    enabled: true,
    category: 'Escalation',
  },
  {
    policyId: 'POL_004',
    name: 'High-Risk Score Threshold',
    description: 'Transactions with risk score above this value cannot be automatically recovered.',
    key: 'HIGH_RISK_THRESHOLD',
    value: 70,
    type: 'number' as const,
    enabled: true,
    category: 'Risk',
  },
  {
    policyId: 'POL_005',
    name: 'Idempotency Check',
    description: 'Prevents the same recovery action from executing twice for the same transaction.',
    key: 'IDEMPOTENCY_CHECK',
    value: true,
    type: 'boolean' as const,
    enabled: true,
    category: 'Safety',
  },
];

// ─── Demo Transactions ─────────────────────────────────────────────────────────

async function seedDemoTransactions(): Promise<void> {
  // TXN_DEMO_001: Should succeed
  const demo1 = await Transaction.findOneAndUpdate(
    { transactionId: 'TXN_DEMO_001' },
    {
      transactionId: 'TXN_DEMO_001',
      customerId: 'CUST_DEMO_001',
      customerName: 'Arjun Mehta',
      amount: 2499,
      currency: 'INR',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      paymentMethod: 'UPI',
      status: 'RECOVERED',
      failureReason: 'BANK_TIMEOUT',
      failureCount: 0,
      customerHistory: 'EXCELLENT',
      riskScore: 18,
      riskLevel: 'LOW',
      recoveryProbability: 84,
      recommendedAction: 'RETRY',
      actualAction: 'RETRY',
      recoveryStatus: 'RECOVERED',
      recoveredAmount: 2499,
      policyResult: 'ALLOWED',
      isDemo: true,
    },
    { upsert: true, new: true }
  );
  console.log('  ✅ TXN_DEMO_001 seeded');

  // TXN_DEMO_002: Should be blocked + escalated
  const demo2 = await Transaction.findOneAndUpdate(
    { transactionId: 'TXN_DEMO_002' },
    {
      transactionId: 'TXN_DEMO_002',
      customerId: 'CUST_DEMO_002',
      customerName: 'Priya Singh',
      amount: 25000,
      currency: 'INR',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      paymentMethod: 'CREDIT_CARD',
      status: 'ESCALATED',
      failureReason: 'CARD_DECLINED',
      failureCount: 5,
      customerHistory: 'POOR',
      riskScore: 86,
      riskLevel: 'HIGH',
      recoveryProbability: 12,
      recommendedAction: 'RETRY',
      actualAction: 'ESCALATE',
      recoveryStatus: 'ESCALATED',
      recoveredAmount: 0,
      policyResult: 'BLOCKED',
      isDemo: true,
    },
    { upsert: true, new: true }
  );
  console.log('  ✅ TXN_DEMO_002 seeded');

  // Demo recovery cases
  await RecoveryCase.findOneAndUpdate(
    { transactionId: 'TXN_DEMO_001' },
    {
      caseId: 'CASE_DEMO_001',
      transactionId: 'TXN_DEMO_001',
      customerId: 'CUST_DEMO_001',
      amount: 2499,
      aiRecommendedAction: 'RETRY',
      policyResult: 'ALLOWED',
      policyReason: 'All policy checks passed.',
      finalAction: 'RETRY',
      status: 'RECOVERED',
      recoveredAmount: 2499,
      executionResult: 'SUCCESS',
      riskScore: 18,
    },
    { upsert: true, new: true }
  );

  await RecoveryCase.findOneAndUpdate(
    { transactionId: 'TXN_DEMO_002' },
    {
      caseId: 'CASE_DEMO_002',
      transactionId: 'TXN_DEMO_002',
      customerId: 'CUST_DEMO_002',
      amount: 25000,
      aiRecommendedAction: 'RETRY',
      policyResult: 'BLOCKED',
      policyReason: 'Risk score 86 exceeds threshold of 70. Manual review required.',
      finalAction: 'ESCALATE',
      status: 'ESCALATED',
      recoveredAmount: 0,
      executionResult: null,
      riskScore: 86,
    },
    { upsert: true, new: true }
  );

  // Demo audit logs
  const demoAudits = [
    { transactionId: 'TXN_DEMO_001', action: 'TRANSACTION_DETECTED', reason: 'Failed payment detected by RecoverAI agent.', riskScore: 18, policyResult: 'ALLOWED', executionResult: null, recoveredAmount: 0 },
    { transactionId: 'TXN_DEMO_001', action: 'FAILURE_CLASSIFIED', reason: 'Failure classified as BANK_TIMEOUT. Temporary failure with high recovery likelihood.', riskScore: 18, policyResult: 'ALLOWED', executionResult: null, recoveredAmount: 0 },
    { transactionId: 'TXN_DEMO_001', action: 'ANALYSIS_COMPLETE', reason: 'Risk: 18. Recommended: RETRY. Policy: ALLOWED.', riskScore: 18, policyResult: 'ALLOWED', executionResult: null, recoveredAmount: 0 },
    { transactionId: 'TXN_DEMO_001', action: 'RECOVERY_INITIATED', reason: 'Action: RETRY initiated by RecoverAI agent.', riskScore: 18, policyResult: 'ALLOWED', executionResult: null, recoveredAmount: 0 },
    { transactionId: 'TXN_DEMO_001', action: 'RECOVERY_EXECUTED', reason: 'Payment verified. Simulation ref: SIM_TXN_DEMO_001. Payment processed successfully.', riskScore: 18, policyResult: 'ALLOWED', executionResult: 'SUCCESS', recoveredAmount: 2499 },
    { transactionId: 'TXN_DEMO_002', action: 'TRANSACTION_DETECTED', reason: 'Failed payment detected by RecoverAI agent.', riskScore: 86, policyResult: null, executionResult: null, recoveredAmount: 0 },
    { transactionId: 'TXN_DEMO_002', action: 'ANALYSIS_COMPLETE', reason: 'Risk: 86 (HIGH). Policy BLOCKED: Risk score exceeds threshold of 70.', riskScore: 86, policyResult: 'BLOCKED', executionResult: null, recoveredAmount: 0 },
    { transactionId: 'TXN_DEMO_002', action: 'ESCALATED', reason: 'Escalated to human review. High risk score + multiple failures.', riskScore: 86, policyResult: 'BLOCKED', executionResult: 'ESCALATED', recoveredAmount: 0 },
  ];

  for (const audit of demoAudits) {
    await AuditLog.findOneAndUpdate(
      { transactionId: audit.transactionId, action: audit.action },
      { eventId: uuidv4(), ...audit, timestamp: new Date() },
      { upsert: true }
    );
  }
}

// ─── Main Seed ────────────────────────────────────────────────────────────────

async function seed() {
  console.log('\n🌱 RecoverAI Database Seeder');
  console.log('═══════════════════════════════════════');

  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB\n');

  // Clear existing data (except demo transactions)
  console.log('🗑️  Clearing existing data...');
  await Promise.all([
    Customer.deleteMany({}),
    Transaction.deleteMany({ isDemo: { $ne: true } }),
    RecoveryCase.deleteMany({ caseId: { $nin: ['CASE_DEMO_001', 'CASE_DEMO_002'] } }),
    AgentDecision.deleteMany({}),
    AuditLog.deleteMany({ transactionId: { $nin: ['TXN_DEMO_001', 'TXN_DEMO_002'] } }),
    Policy.deleteMany({}),
  ]);

  // Seed policies
  console.log('📋 Seeding policies...');
  await Policy.insertMany(DEFAULT_POLICIES);
  console.log(`   ✅ ${DEFAULT_POLICIES.length} policies created`);

  // Seed demo transactions
  console.log('\n🎭 Seeding demo transactions...');
  await seedDemoTransactions();

  // Seed customers
  console.log('\n👥 Seeding 500 customers...');
  const customers: unknown[] = [];
  const customerIds: string[] = [];
  for (let i = 0; i < 500; i++) {
    const cId = `CUST_${String(i + 1).padStart(5, '0')}`;
    customerIds.push(cId);
    const hist = (weightedRandom<{ history: CustomerHistory; weight: number }>(CUSTOMER_HISTORIES as { history: CustomerHistory; weight: number }[])).history;
    customers.push({
      customerId: cId,
      name: `${FIRST_NAMES[randInt(0, FIRST_NAMES.length - 1)]} ${LAST_NAMES[randInt(0, LAST_NAMES.length - 1)]}`,
      email: `user${i + 1}@example.com`,
      history: hist,
      totalTransactions: randInt(1, 50),
      failedTransactions: randInt(1, 10),
    });
  }
  await Customer.insertMany(customers);
  console.log('   ✅ 500 customers created');

  // Seed 10,000 transactions in batches
  console.log('\n💳 Seeding 10,000 transactions...');
  const BATCH_SIZE = 500;
  const TOTAL = 10000;
  let totalRecovered = 0;
  let totalAtRisk = 0;

  for (let batch = 0; batch < TOTAL / BATCH_SIZE; batch++) {
    const txBatch: unknown[] = [];
    const rcBatch: unknown[] = [];
    const adBatch: unknown[] = [];
    const alBatch: unknown[] = [];

    for (let i = 0; i < BATCH_SIZE; i++) {
      const txIndex = batch * BATCH_SIZE + i;
      const txId = `TXN_${String(txIndex + 1).padStart(5, '0')}`;
      const customerId = customerIds[randInt(0, customerIds.length - 1)];
      const customerName = (customers[customerIds.indexOf(customerId)] as { name: string }).name;

      const failureItem = weightedRandom<{ reason: FailureReason; weight: number }>(FAILURE_REASONS as { reason: FailureReason; weight: number }[]);
      const methodItem = weightedRandom<{ method: PaymentMethod; weight: number }>(PAYMENT_METHODS as { method: PaymentMethod; weight: number }[]);
      const histItem = weightedRandom<{ history: CustomerHistory; weight: number }>(CUSTOMER_HISTORIES as { history: CustomerHistory; weight: number }[]);

      const failureReason = failureItem.reason;
      const paymentMethod = methodItem.method;
      const customerHistory = histItem.history;
      const amount = randomAmount();
      const failureCount = failureReason === 'CARD_DECLINED' && Math.random() < 0.3 ? randInt(2, 6) : randInt(1, 3);
      const timestamp = randomDate(60);
      const ageMinutes = Math.floor((Date.now() - timestamp.getTime()) / 60000);

      const riskResult = calculateRisk({
        amount, failureReason, failureCount, customerHistory, paymentMethod, transactionAgeMinutes: ageMinutes,
      });

      const aiAction = determineFallbackAction(failureReason, riskResult.score, failureCount, riskResult.recoveryProbability);

      // Determine actual outcome based on risk level
      const successRate = RECOVERY_SUCCESS_BY_RISK[riskResult.level] ?? 0.4;
      const isBlocked = riskResult.score > 70 || failureCount > 3 || amount > 50000;
      const isRecovered = !isBlocked && Math.random() < successRate;
      const isPending = !isBlocked && !isRecovered && Math.random() < 0.3;

      let recoveryStatus: RecoveryStatus;
      let status: string;
      let recoveredAmount = 0;
      let actualAction: RecoveryAction | null = null;
      let policyResult = 'ALLOWED';

      if (isBlocked) {
        recoveryStatus = riskResult.score > 70 ? 'ESCALATED' : 'BLOCKED';
        status = riskResult.score > 70 ? 'ESCALATED' : 'BLOCKED';
        actualAction = 'ESCALATE';
        policyResult = 'BLOCKED';
      } else if (isRecovered) {
        recoveryStatus = 'RECOVERED';
        status = 'RECOVERED';
        recoveredAmount = amount;
        actualAction = aiAction;
        totalRecovered += amount;
      } else if (isPending) {
        recoveryStatus = 'PENDING';
        status = 'FAILED';
        totalAtRisk += amount;
      } else {
        recoveryStatus = 'FAILED';
        status = 'FAILED';
        totalAtRisk += amount;
      }

      txBatch.push({
        transactionId: txId,
        customerId,
        customerName,
        amount,
        currency: 'INR',
        timestamp,
        paymentMethod,
        status,
        failureReason,
        failureCount,
        customerHistory,
        riskScore: riskResult.score,
        riskLevel: riskResult.level,
        recoveryProbability: riskResult.recoveryProbability,
        recommendedAction: aiAction,
        actualAction,
        recoveryStatus,
        recoveredAmount,
        policyResult,
        isDemo: false,
      });

      // Recovery case for non-pending
      if (!isPending) {
        rcBatch.push({
          caseId: uuidv4(),
          transactionId: txId,
          customerId,
          amount,
          aiRecommendedAction: aiAction,
          policyResult: isBlocked ? 'BLOCKED' : 'ALLOWED',
          policyReason: isBlocked ? 'Policy constraint triggered.' : 'All policy checks passed.',
          finalAction: actualAction || aiAction,
          status: recoveryStatus,
          recoveredAmount,
          executionResult: isRecovered ? 'SUCCESS' : isBlocked ? null : 'FAILED',
          riskScore: riskResult.score,
        });

        adBatch.push({
          decisionId: uuidv4(),
          transactionId: txId,
          timestamp,
          failureReason,
          riskScore: riskResult.score,
          recoveryProbability: riskResult.recoveryProbability,
          amount,
          previousFailures: failureCount,
          customerHistory,
          aiRecommendedAction: aiAction,
          policyResult: isBlocked ? 'BLOCKED' : 'ALLOWED',
          policyReason: isBlocked ? 'Policy constraint triggered.' : 'All checks passed.',
          finalAction: actualAction || aiAction,
          explanation: `Failure: ${failureReason}. Risk: ${riskResult.score}. Recovery probability: ${riskResult.recoveryProbability}%.`,
          aiUsed: false,
        });

        alBatch.push({
          eventId: uuidv4(),
          transactionId: txId,
          timestamp,
          agent: 'RecoverAI-Agent',
          action: isRecovered ? 'RECOVERY_EXECUTED' : isBlocked ? 'ESCALATED' : 'RECOVERY_FAILED',
          reason: isRecovered ? `₹${amount} recovered successfully.` : isBlocked ? 'Blocked by policy.' : 'Recovery attempt failed.',
          riskScore: riskResult.score,
          policyResult: isBlocked ? 'BLOCKED' : 'ALLOWED',
          executionResult: isRecovered ? 'SUCCESS' : isBlocked ? 'ESCALATED' : 'FAILED',
          recoveredAmount,
          metadata: { isDemo: false },
        });
      }
    }

    await Transaction.insertMany(txBatch);
    if (rcBatch.length) await RecoveryCase.insertMany(rcBatch);
    if (adBatch.length) await AgentDecision.insertMany(adBatch);
    if (alBatch.length) await AuditLog.insertMany(alBatch);

    process.stdout.write(`\r   Batch ${batch + 1}/${TOTAL / BATCH_SIZE} complete (${(batch + 1) * BATCH_SIZE} transactions)`);
  }

  console.log('\n\n   ✅ 10,000 transactions seeded');
  console.log(`   💰 Revenue recovered: ₹${totalRecovered.toLocaleString('en-IN')}`);
  console.log(`   ⚠️  Revenue at risk:  ₹${totalAtRisk.toLocaleString('en-IN')}`);

  // Final count
  const [txCount, rcCount, adCount, alCount] = await Promise.all([
    Transaction.countDocuments(),
    RecoveryCase.countDocuments(),
    AgentDecision.countDocuments(),
    AuditLog.countDocuments(),
  ]);

  console.log('\n═══════════════════════════════════════');
  console.log('📊 Final Database Summary:');
  console.log(`   Transactions: ${txCount.toLocaleString()}`);
  console.log(`   Recovery Cases: ${rcCount.toLocaleString()}`);
  console.log(`   Agent Decisions: ${adCount.toLocaleString()}`);
  console.log(`   Audit Logs: ${alCount.toLocaleString()}`);
  console.log(`   Policies: ${DEFAULT_POLICIES.length}`);
  console.log('\n✅ Seed complete!\n');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
