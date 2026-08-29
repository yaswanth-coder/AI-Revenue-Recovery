import { RecoveryAction, PolicyResult } from '../types';
import Policy from '../models/Policy';

export interface PolicyInput {
  action: RecoveryAction;
  amount: number;
  riskScore: number;
  failureCount: number;
  transactionId: string;
  alreadyRetried?: boolean;
}

export interface PolicyEvaluation {
  result: PolicyResult;
  reason: string;
  finalAction: RecoveryAction;
}

export interface PolicyMap {
  MAX_AUTO_RETRIES: number;
  HIGH_VALUE_THRESHOLD: number;
  MAX_FAILURES_BEFORE_ESCALATION: number;
  HIGH_RISK_THRESHOLD: number;
  IDEMPOTENCY_CHECK: boolean;
}

export const DEFAULT_POLICIES: PolicyMap = {
  MAX_AUTO_RETRIES: 1,
  HIGH_VALUE_THRESHOLD: 50000,
  MAX_FAILURES_BEFORE_ESCALATION: 3,
  HIGH_RISK_THRESHOLD: 70,
  IDEMPOTENCY_CHECK: true,
};

export async function loadPolicies(): Promise<PolicyMap> {
  try {
    const policies = await Policy.find({ enabled: true });
    const map: PolicyMap = { ...DEFAULT_POLICIES };
    for (const p of policies) {
      if (p.key in map) {
        (map as unknown as Record<string, unknown>)[p.key] = p.value;
      }
    }
    return map;
  } catch {
    return DEFAULT_POLICIES;
  }
}

/**
 * Pure function — evaluates a proposed action against policy constraints.
 * AI cannot bypass this function. Order of checks matters (most critical first).
 */
export function evaluatePolicy(input: PolicyInput, policies: PolicyMap): PolicyEvaluation {
  // P1: Idempotency — prevent double retry
  if (input.alreadyRetried && policies.IDEMPOTENCY_CHECK && input.action === 'RETRY') {
    return {
      result: 'BLOCKED',
      reason: 'Idempotency check: this transaction has already been retried automatically.',
      finalAction: 'BLOCK',
    };
  }

  // P2: High risk — risk score exceeds threshold
  if (input.riskScore > policies.HIGH_RISK_THRESHOLD) {
    return {
      result: 'BLOCKED',
      reason: `Risk score ${input.riskScore} exceeds threshold of ${policies.HIGH_RISK_THRESHOLD}. Manual review required.`,
      finalAction: 'ESCALATE',
    };
  }

  // P3: Failure count — too many attempts
  if (input.failureCount > policies.MAX_FAILURES_BEFORE_ESCALATION) {
    return {
      result: 'BLOCKED',
      reason: `Failure count ${input.failureCount} exceeds maximum of ${policies.MAX_FAILURES_BEFORE_ESCALATION}. Escalating to human review.`,
      finalAction: 'ESCALATE',
    };
  }

  // P4: High-value transaction — requires human approval
  if (input.amount > policies.HIGH_VALUE_THRESHOLD && input.action === 'RETRY') {
    return {
      result: 'REQUIRES_APPROVAL',
      reason: `Transaction amount ₹${input.amount.toLocaleString('en-IN')} exceeds high-value threshold of ₹${policies.HIGH_VALUE_THRESHOLD.toLocaleString('en-IN')}. Human approval required.`,
      finalAction: 'ESCALATE',
    };
  }

  // P5: Max auto retries check
  if (input.failureCount > policies.MAX_AUTO_RETRIES && input.action === 'RETRY') {
    return {
      result: 'BLOCKED',
      reason: `Retry limit exceeded: ${input.failureCount} failures vs max auto retries of ${policies.MAX_AUTO_RETRIES}.`,
      finalAction: 'ESCALATE',
    };
  }

  // All checks passed
  return {
    result: 'ALLOWED',
    reason: 'All policy checks passed. Automatic execution permitted.',
    finalAction: input.action,
  };
}
