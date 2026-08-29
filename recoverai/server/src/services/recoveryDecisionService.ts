import { FailureReason, PaymentMethod, CustomerHistory, RecoveryAction } from '../types';
import { calculateRisk, RiskResult } from './riskEngine';
import { evaluatePolicy, loadPolicies, PolicyEvaluation } from './policyEngine';

export interface DecisionInput {
  transactionId: string;
  amount: number;
  failureReason: FailureReason;
  failureCount: number;
  customerHistory: CustomerHistory;
  paymentMethod: PaymentMethod;
  transactionAgeMinutes: number;
  alreadyRetried?: boolean;
}

export interface DecisionResult {
  riskResult: RiskResult;
  aiRecommendedAction: RecoveryAction;
  policyEvaluation: PolicyEvaluation;
  finalAction: RecoveryAction;
  explanation: string;
  aiUsed: boolean;
}

/**
 * Deterministic fallback action selector (also used when AI is disabled).
 * Maps failure reason + risk + context to a recovery action.
 */
export function determineFallbackAction(
  failureReason: FailureReason,
  riskScore: number,
  failureCount: number,
  recoveryProbability: number
): RecoveryAction {
  if (riskScore > 70) return 'ESCALATE';
  if (failureCount > 3) return 'ESCALATE';

  switch (failureReason) {
    case 'BANK_TIMEOUT':
    case 'NETWORK_ERROR':
      return recoveryProbability > 60 ? 'RETRY' : 'SEND_REMINDER';
    case 'AUTHENTICATION_FAILURE':
      return 'RETRY';
    case 'CARD_DECLINED':
      return failureCount <= 1 ? 'RETRY' : 'CHANGE_PAYMENT_METHOD';
    case 'INSUFFICIENT_FUNDS':
      return 'SEND_REMINDER';
    case 'EXPIRED_CARD':
      return 'CHANGE_PAYMENT_METHOD';
    case 'LIMIT_EXCEEDED':
      return 'SEND_REMINDER';
    case 'UNKNOWN_ERROR':
      return recoveryProbability > 60 ? 'RETRY' : failureCount > 1 ? 'BLOCK' : 'SEND_REMINDER';
    default:
      return recoveryProbability > 70 ? 'RETRY' : 'SEND_REMINDER';
  }
}

function buildExplanation(
  input: DecisionInput,
  riskResult: RiskResult,
  aiAction: RecoveryAction,
  policyEval: PolicyEvaluation
): string {
  const actionLabel = input.alreadyRetried ? '(already retried)' : '';
  return (
    `Failure: ${input.failureReason.replace(/_/g, ' ')}. ` +
    `Risk Score: ${riskResult.score}/100 (${riskResult.level}). ` +
    `Recovery Probability: ${riskResult.recoveryProbability}%. ` +
    `Previous Failures: ${input.failureCount} ${actionLabel}. ` +
    `Customer History: ${input.customerHistory}. ` +
    `AI Recommended: ${aiAction}. ` +
    `Policy: ${policyEval.result} — ${policyEval.reason}`
  );
}

export async function makeRecoveryDecision(input: DecisionInput): Promise<DecisionResult> {
  // Step 1: Calculate risk (deterministic)
  const riskResult = calculateRisk({
    amount: input.amount,
    failureReason: input.failureReason,
    failureCount: input.failureCount,
    customerHistory: input.customerHistory,
    paymentMethod: input.paymentMethod,
    transactionAgeMinutes: input.transactionAgeMinutes,
  });

  // Step 2: AI recommendation (deterministic fallback, same function used by AI abstraction)
  const aiRecommendedAction = determineFallbackAction(
    input.failureReason,
    riskResult.score,
    input.failureCount,
    riskResult.recoveryProbability
  );

  // Step 3: Load live policies from DB
  const policies = await loadPolicies();

  // Step 4: Policy Engine evaluation (CANNOT be bypassed)
  const policyEvaluation = evaluatePolicy(
    {
      action: aiRecommendedAction,
      amount: input.amount,
      riskScore: riskResult.score,
      failureCount: input.failureCount,
      transactionId: input.transactionId,
      alreadyRetried: input.alreadyRetried,
    },
    policies
  );

  const finalAction = policyEvaluation.finalAction;
  const explanation = buildExplanation(input, riskResult, aiRecommendedAction, policyEvaluation);

  return {
    riskResult,
    aiRecommendedAction,
    policyEvaluation,
    finalAction,
    explanation,
    aiUsed: false,
  };
}
