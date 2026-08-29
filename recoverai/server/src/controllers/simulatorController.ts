import { Request, Response, NextFunction } from 'express';
import { makeRecoveryDecision } from '../services/recoveryDecisionService';
import { simulatePayment } from '../services/paymentSimulator';
import { verifyRecovery } from '../services/verificationService';
import { logAuditEvent } from '../services/auditService';
import { generateDecisionExplanation } from '../services/aiService';
import { FailureReason, PaymentMethod, CustomerHistory } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface SimStep {
  step: string;
  status: 'COMPLETE' | 'FAILED' | 'BLOCKED' | 'ESCALATED' | 'SKIPPED' | 'PROCESSING';
  detail: string;
  timestamp: string;
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export async function runSimulation(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const {
      amount,
      paymentMethod,
      failureReason,
      previousFailures = 0,
      customerHistory = 'GOOD',
      transactionAgeMinutes = 5,
    } = req.body as {
      amount: number;
      paymentMethod: PaymentMethod;
      failureReason: FailureReason;
      previousFailures: number;
      customerHistory: CustomerHistory;
      transactionAgeMinutes: number;
    };

    const txId = `SIM_${uuidv4().slice(0, 8).toUpperCase()}`;
    const steps: SimStep[] = [];
    const ts = () => new Date().toISOString();

    // Step 1: Detect
    await delay(150);
    steps.push({ step: 'DETECT', status: 'COMPLETE', detail: `Transaction ${txId} detected. Amount: ₹${Number(amount).toLocaleString('en-IN')}`, timestamp: ts() });

    // Step 2: Diagnose
    await delay(200);
    steps.push({ step: 'DIAGNOSE', status: 'COMPLETE', detail: `Failure classified: ${String(failureReason).replace(/_/g, ' ')}`, timestamp: ts() });

    // Step 3: Risk Assessment
    await delay(250);
    const decision = await makeRecoveryDecision({
      transactionId: txId,
      amount: Number(amount),
      failureReason: failureReason as FailureReason,
      failureCount: Number(previousFailures),
      customerHistory: customerHistory as CustomerHistory,
      paymentMethod: paymentMethod as PaymentMethod,
      transactionAgeMinutes: Number(transactionAgeMinutes),
      alreadyRetried: false,
    });
    steps.push({
      step: 'RISK_ASSESSMENT',
      status: 'COMPLETE',
      detail: `Risk Score: ${decision.riskResult.score}/100 (${decision.riskResult.level}). Recovery Probability: ${decision.riskResult.recoveryProbability}%`,
      timestamp: ts(),
    });

    // Step 4: Policy Validation
    await delay(200);
    const policyPassed = decision.policyEvaluation.result === 'ALLOWED';
    steps.push({
      step: 'POLICY_VALIDATION',
      status: policyPassed ? 'COMPLETE' : 'BLOCKED',
      detail: `Policy: ${decision.policyEvaluation.result} — ${decision.policyEvaluation.reason}`,
      timestamp: ts(),
    });

    // Step 5: Decision
    await delay(150);
    steps.push({
      step: 'DECISION',
      status: policyPassed ? 'COMPLETE' : 'BLOCKED',
      detail: `AI Recommended: ${decision.aiRecommendedAction}. Policy Final: ${decision.finalAction}`,
      timestamp: ts(),
    });

    // Step 6 + 7: Execution + Verification
    let outcome = 'SKIPPED';
    let recoveredAmount = 0;
    let simulationResult = null;
    let verificationResult = null;

    if (decision.finalAction === 'RETRY') {
      await delay(300);
      simulationResult = await simulatePayment(txId, Number(amount), paymentMethod, failureReason);
      outcome = simulationResult.outcome;
      steps.push({
        step: 'EXECUTION',
        status: outcome === 'SUCCESS' ? 'COMPLETE' : 'FAILED',
        detail: `Payment simulation: ${outcome}. Ref: ${simulationResult.transactionRef}`,
        timestamp: ts(),
      });

      await delay(200);
      verificationResult = verifyRecovery(txId, Number(amount), simulationResult);
      recoveredAmount = verificationResult.recoveredAmount;
      steps.push({
        step: 'VERIFICATION',
        status: verificationResult.verified ? 'COMPLETE' : 'FAILED',
        detail: verificationResult.reason,
        timestamp: ts(),
      });
    } else {
      await delay(200);
      steps.push({
        step: 'EXECUTION',
        status: decision.finalAction === 'ESCALATE' ? 'ESCALATED' : 'BLOCKED',
        detail: `Action: ${decision.finalAction}. ${decision.policyEvaluation.reason}`,
        timestamp: ts(),
      });
      await delay(100);
      steps.push({
        step: 'VERIFICATION',
        status: 'SKIPPED',
        detail: 'No payment executed — verification skipped.',
        timestamp: ts(),
      });
    }

    // Step 8: Audit
    await delay(100);
    await logAuditEvent({
      transactionId: txId,
      action: 'SIMULATION_COMPLETE',
      reason: `Simulation finished. Final action: ${decision.finalAction}. Outcome: ${outcome}`,
      riskScore: decision.riskResult.score,
      policyResult: decision.policyEvaluation.result,
      executionResult: outcome,
      recoveredAmount,
      metadata: { isSimulation: true, paymentMethod, failureReason },
    });
    steps.push({ step: 'AUDIT', status: 'COMPLETE', detail: 'Complete audit record created and stored.', timestamp: ts() });

    const aiResult = await generateDecisionExplanation({
      transactionId: txId,
      failureReason: failureReason as FailureReason,
      amount: Number(amount),
      riskScore: decision.riskResult.score,
      recoveryProbability: decision.riskResult.recoveryProbability,
      customerHistory: customerHistory as string,
      previousFailures: Number(previousFailures),
      recommendedAction: decision.aiRecommendedAction,
    });

    res.json({
      success: true,
      data: {
        simulationId: txId,
        steps,
        decision,
        recoveredAmount,
        outcome,
        explanation: aiResult.explanation,
        aiUsed: aiResult.aiUsed,
        simulationResult,
        verificationResult,
      },
    });
  } catch (err) {
    next(err);
  }
}
