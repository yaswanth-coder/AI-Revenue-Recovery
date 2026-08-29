import { FailureReason, PaymentMethod, CustomerHistory, RiskLevel } from '../types';

export interface RiskInput {
  amount: number;
  failureReason: FailureReason;
  failureCount: number;
  customerHistory: CustomerHistory;
  paymentMethod: PaymentMethod;
  transactionAgeMinutes: number;
}

export interface RiskFactor {
  factor: string;
  impact: number;
  description: string;
}

export interface RiskResult {
  score: number;
  level: RiskLevel;
  factors: RiskFactor[];
  recoveryProbability: number;
}

const FAILURE_RISK: Record<FailureReason, number> = {
  BANK_TIMEOUT: 5,
  NETWORK_ERROR: 8,
  AUTHENTICATION_FAILURE: 15,
  CARD_DECLINED: 25,
  INSUFFICIENT_FUNDS: 30,
  LIMIT_EXCEEDED: 20,
  EXPIRED_CARD: 35,
  UNKNOWN_ERROR: 20,
};

const CUSTOMER_HISTORY_RISK: Record<CustomerHistory, number> = {
  EXCELLENT: 0,
  GOOD: 5,
  FAIR: 15,
  POOR: 30,
  NEW: 10,
};

const PAYMENT_METHOD_RISK: Record<PaymentMethod, number> = {
  UPI: 3,
  NET_BANKING: 5,
  DEBIT_CARD: 8,
  CREDIT_CARD: 10,
  WALLET: 6,
};

export function calculateRisk(input: RiskInput): RiskResult {
  const factors: RiskFactor[] = [];
  let score = 0;

  // Factor 1: Failure reason
  const failureImpact = FAILURE_RISK[input.failureReason];
  score += failureImpact;
  factors.push({
    factor: 'Failure Reason',
    impact: failureImpact,
    description: `${input.failureReason.replace(/_/g, ' ')}`,
  });

  // Factor 2: Previous failure count
  const failureCountImpact = Math.min(input.failureCount * 10, 30);
  score += failureCountImpact;
  factors.push({
    factor: 'Failure Count',
    impact: failureCountImpact,
    description: `${input.failureCount} previous failure${input.failureCount !== 1 ? 's' : ''}`,
  });

  // Factor 3: Customer history
  const historyImpact = CUSTOMER_HISTORY_RISK[input.customerHistory];
  score += historyImpact;
  factors.push({
    factor: 'Customer History',
    impact: historyImpact,
    description: input.customerHistory,
  });

  // Factor 4: Transaction amount
  const amountImpact = input.amount > 50000 ? 20 : input.amount > 10000 ? 10 : input.amount > 5000 ? 5 : 0;
  score += amountImpact;
  factors.push({
    factor: 'Transaction Amount',
    impact: amountImpact,
    description: `₹${input.amount.toLocaleString('en-IN')}`,
  });

  // Factor 5: Payment method
  const methodImpact = PAYMENT_METHOD_RISK[input.paymentMethod];
  score += methodImpact;
  factors.push({
    factor: 'Payment Method',
    impact: methodImpact,
    description: input.paymentMethod.replace(/_/g, ' '),
  });

  // Factor 6: Transaction age
  const ageImpact = input.transactionAgeMinutes > 1440 ? 5 : 0;
  score += ageImpact;
  if (ageImpact > 0) {
    factors.push({
      factor: 'Transaction Age',
      impact: ageImpact,
      description: 'Older than 24 hours',
    });
  }

  score = Math.min(Math.max(Math.round(score), 0), 100);
  const level: RiskLevel = score <= 30 ? 'LOW' : score <= 70 ? 'MEDIUM' : 'HIGH';

  // Recovery probability: inversely related to risk, boosted for temporary failures
  const temporaryFailures: FailureReason[] = ['BANK_TIMEOUT', 'NETWORK_ERROR'];
  const baseRecovery = 100 - score;
  const boost = temporaryFailures.includes(input.failureReason) ? 15 : -5;
  const recoveryProbability = Math.min(Math.max(Math.round(baseRecovery + boost), 5), 95);

  return { score, level, factors, recoveryProbability };
}
