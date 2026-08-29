export type FailureReason =
  | 'BANK_TIMEOUT'
  | 'INSUFFICIENT_FUNDS'
  | 'CARD_DECLINED'
  | 'NETWORK_ERROR'
  | 'AUTHENTICATION_FAILURE'
  | 'EXPIRED_CARD'
  | 'LIMIT_EXCEEDED'
  | 'UNKNOWN_ERROR';

export type PaymentMethod = 'CREDIT_CARD' | 'DEBIT_CARD' | 'NET_BANKING' | 'UPI' | 'WALLET';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export type RecoveryAction =
  | 'RETRY'
  | 'SEND_REMINDER'
  | 'CHANGE_PAYMENT_METHOD'
  | 'ESCALATE'
  | 'BLOCK'
  | 'NO_ACTION';

export type TransactionStatus = 'FAILED' | 'RECOVERED' | 'PENDING' | 'BLOCKED' | 'ESCALATED';

export type RecoveryStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'RECOVERED'
  | 'FAILED'
  | 'ESCALATED'
  | 'BLOCKED';

export type PolicyResult = 'ALLOWED' | 'BLOCKED' | 'REQUIRES_APPROVAL';

export type CustomerHistory = 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'NEW';

export type SimulationOutcome = 'SUCCESS' | 'FAILED' | 'TIMEOUT' | 'DECLINED';

export interface Transaction {
  _id?: string;
  transactionId: string;
  customerId: string;
  customerName: string;
  amount: number;
  currency: string;
  timestamp: string;
  paymentMethod: PaymentMethod;
  status: TransactionStatus;
  failureReason: FailureReason;
  failureCount: number;
  customerHistory: CustomerHistory;
  riskScore: number;
  riskLevel: RiskLevel;
  recoveryProbability: number;
  recommendedAction: RecoveryAction;
  actualAction: RecoveryAction | null;
  recoveryStatus: RecoveryStatus;
  recoveredAmount: number;
  policyResult: string | null;
  isDemo?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface KPIStats {
  revenueAtRisk: number;
  revenueRecovered: number;
  recoveryRate: number;
  activeCases: number;
  transactionsAnalyzed: number;
  humanEscalations: number;
  agentDecisions: number;
  actionsBlocked: number;
}

export interface AgentDecision {
  _id?: string;
  decisionId: string;
  transactionId: string;
  timestamp: string;
  failureReason: string;
  riskScore: number;
  recoveryProbability: number;
  amount: number;
  previousFailures: number;
  customerHistory: string;
  aiRecommendedAction: RecoveryAction;
  policyResult: PolicyResult;
  policyReason: string;
  finalAction: RecoveryAction;
  explanation: string;
  aiUsed: boolean;
  createdAt?: string;
}

export interface AuditLog {
  _id?: string;
  eventId: string;
  transactionId: string;
  timestamp: string;
  agent: string;
  action: string;
  reason: string;
  riskScore: number | null;
  policyResult: string | null;
  executionResult: string | null;
  recoveredAmount: number;
  metadata?: Record<string, unknown>;
}

export interface RecoveryCase {
  _id?: string;
  caseId: string;
  transactionId: string;
  customerId: string;
  amount: number;
  aiRecommendedAction: RecoveryAction;
  policyResult: PolicyResult;
  policyReason: string;
  finalAction: RecoveryAction;
  status: RecoveryStatus;
  recoveredAmount: number;
  executionResult: string | null;
  riskScore: number;
  createdAt?: string;
}

export interface Policy {
  _id?: string;
  policyId: string;
  name: string;
  description: string;
  key: string;
  value: number | boolean | string;
  type: 'number' | 'boolean' | 'string';
  enabled: boolean;
  category: string;
}

export interface SimulationStep {
  step: string;
  status: 'COMPLETE' | 'FAILED' | 'BLOCKED' | 'ESCALATED' | 'SKIPPED' | 'PROCESSING';
  detail: string;
  timestamp: string;
}

export interface SimulationResponse {
  simulationId: string;
  steps: SimulationStep[];
  decision: {
    riskResult: {
      score: number;
      level: RiskLevel;
      recoveryProbability: number;
      factors: { factor: string; impact: number; description: string }[];
    };
    aiRecommendedAction: RecoveryAction;
    policyEvaluation: {
      result: PolicyResult;
      reason: string;
      finalAction: RecoveryAction;
    };
    finalAction: RecoveryAction;
    explanation: string;
    aiUsed: boolean;
  };
  recoveredAmount: number;
  outcome: string;
  explanation: string;
  aiUsed: boolean;
  simulationResult?: {
    outcome: SimulationOutcome;
    transactionRef: string;
    latencyMs: number;
    reason: string;
  };
  verificationResult?: {
    verified: boolean;
    recoveredAmount: number;
    verificationRef: string;
    reason: string;
  };
}

export interface AnalyticsData {
  failureDistribution: { _id: string; count: number; totalAmount: number }[];
  recoveryByMethod: { _id: string; recovered: number; total: number; count: number }[];
  actionDistribution: { _id: string; count: number }[];
  dailyRecovery: { _id: string; atRisk: number; recovered: number; count: number }[];
  riskDistribution: { _id: string; count: number }[];
  recoveryStatusDist: { _id: string; count: number }[];
  totals: {
    totalAtRisk: number;
    totalRecovered: number;
    totalTransactions: number;
    recoveryRate: number;
  };
  blockedActions: number;
  escalations: number;
  totalDecisions: number;
  policyBlockRate: number;
  escalationRate: number;
}
