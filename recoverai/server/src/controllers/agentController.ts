import { Request, Response, NextFunction } from 'express';
import Transaction from '../models/Transaction';
import AgentDecision from '../models/AgentDecision';
import RecoveryCase from '../models/RecoveryCase';
import { makeRecoveryDecision } from '../services/recoveryDecisionService';
import { generateDecisionExplanation } from '../services/aiService';
import { simulatePayment } from '../services/paymentSimulator';
import { verifyRecovery } from '../services/verificationService';
import { logAuditEvent } from '../services/auditService';
import { v4 as uuidv4 } from 'uuid';
import { FailureReason, PaymentMethod, CustomerHistory } from '../types';

export async function getAgentStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const [totalDecisions, totalExecuted, totalBlocked, totalEscalated, recoveredAgg, totalTx] =
      await Promise.all([
        AgentDecision.countDocuments(),
        AgentDecision.countDocuments({
          finalAction: { $in: ['RETRY', 'SEND_REMINDER', 'CHANGE_PAYMENT_METHOD'] },
        }),
        AgentDecision.countDocuments({ policyResult: 'BLOCKED' }),
        AgentDecision.countDocuments({ finalAction: 'ESCALATE' }),
        Transaction.aggregate([{ $group: { _id: null, total: { $sum: '$recoveredAmount' } } }]),
        Transaction.countDocuments(),
      ]);

    res.json({
      success: true,
      data: {
        status: 'ACTIVE',
        decisionsTotal: totalDecisions,
        actionsExecuted: totalExecuted,
        actionsBlocked: totalBlocked,
        escalations: totalEscalated,
        revenueRecovered: recoveredAgg[0]?.total ?? 0,
        transactionsAnalyzed: totalTx,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function analyzeTransaction(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { transactionId } = req.body as { transactionId: string };

    if (!transactionId) {
      res.status(400).json({ success: false, error: 'transactionId is required' });
      return;
    }

    const tx = await Transaction.findOne({ transactionId });
    if (!tx) {
      res.status(404).json({ success: false, error: 'Transaction not found' });
      return;
    }

    const ageMinutes = Math.floor((Date.now() - tx.timestamp.getTime()) / 60000);
    const alreadyRetried = tx.failureCount > 1;

    const decision = await makeRecoveryDecision({
      transactionId: tx.transactionId,
      amount: tx.amount,
      failureReason: tx.failureReason as FailureReason,
      failureCount: tx.failureCount,
      customerHistory: tx.customerHistory as CustomerHistory,
      paymentMethod: tx.paymentMethod as PaymentMethod,
      transactionAgeMinutes: ageMinutes,
      alreadyRetried,
    });

    const aiResult = await generateDecisionExplanation({
      transactionId: tx.transactionId,
      failureReason: tx.failureReason as FailureReason,
      amount: tx.amount,
      riskScore: decision.riskResult.score,
      recoveryProbability: decision.riskResult.recoveryProbability,
      customerHistory: tx.customerHistory,
      previousFailures: tx.failureCount,
      recommendedAction: decision.aiRecommendedAction,
    });

    // Persist agent decision
    const agentDecision = new AgentDecision({
      decisionId: uuidv4(),
      transactionId: tx.transactionId,
      failureReason: tx.failureReason,
      riskScore: decision.riskResult.score,
      recoveryProbability: decision.riskResult.recoveryProbability,
      amount: tx.amount,
      previousFailures: tx.failureCount,
      customerHistory: tx.customerHistory,
      aiRecommendedAction: decision.aiRecommendedAction,
      policyResult: decision.policyEvaluation.result,
      policyReason: decision.policyEvaluation.reason,
      finalAction: decision.finalAction,
      explanation: aiResult.explanation,
      aiUsed: aiResult.aiUsed,
    });
    await agentDecision.save();

    // Update transaction with latest risk data
    await Transaction.updateOne(
      { transactionId },
      {
        riskScore: decision.riskResult.score,
        riskLevel: decision.riskResult.level,
        recoveryProbability: decision.riskResult.recoveryProbability,
        recommendedAction: decision.aiRecommendedAction,
        policyResult: decision.policyEvaluation.result,
      }
    );

    await logAuditEvent({
      transactionId: tx.transactionId,
      action: 'ANALYSIS_COMPLETE',
      reason: `Agent analysis complete. Risk: ${decision.riskResult.score}. Recommended: ${decision.finalAction}`,
      riskScore: decision.riskResult.score,
      policyResult: decision.policyEvaluation.result,
    });

    res.json({
      success: true,
      data: {
        decision,
        agentDecision,
        explanation: aiResult.explanation,
        aiUsed: aiResult.aiUsed,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function executeRecovery(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { transactionId, action } = req.body as { transactionId: string; action: string };

    if (!transactionId || !action) {
      res.status(400).json({ success: false, error: 'transactionId and action are required' });
      return;
    }

    const tx = await Transaction.findOne({ transactionId });
    if (!tx) {
      res.status(404).json({ success: false, error: 'Transaction not found' });
      return;
    }

    // Idempotency check
    if (tx.recoveryStatus === 'RECOVERED') {
      res.status(400).json({
        success: false,
        error: 'Transaction already recovered. Duplicate execution prevented (idempotency check).',
        code: 'ALREADY_RECOVERED',
      });
      return;
    }

    await Transaction.updateOne({ transactionId }, { recoveryStatus: 'PROCESSING', actualAction: action });
    await logAuditEvent({ transactionId, action: 'RECOVERY_INITIATED', reason: `Action: ${action} initiated` });

    let recoveredAmount = 0;
    let finalStatus: string;
    let executionResult = 'SKIPPED';

    if (action === 'RETRY') {
      const simResult = await simulatePayment(
        tx.transactionId,
        tx.amount,
        tx.paymentMethod,
        tx.failureReason
      );
      const verResult = verifyRecovery(tx.transactionId, tx.amount, simResult);

      recoveredAmount = verResult.recoveredAmount;
      finalStatus = verResult.verified ? 'RECOVERED' : 'FAILED';
      executionResult = simResult.outcome;

      await Transaction.updateOne(
        { transactionId },
        {
          recoveryStatus: finalStatus,
          recoveredAmount,
          status: finalStatus === 'RECOVERED' ? 'RECOVERED' : 'FAILED',
          actualAction: action,
        }
      );

      await RecoveryCase.findOneAndUpdate(
        { transactionId },
        {
          $setOnInsert: { caseId: uuidv4() },
          transactionId,
          customerId: tx.customerId,
          amount: tx.amount,
          aiRecommendedAction: action,
          policyResult: 'ALLOWED',
          policyReason: 'Manual execution',
          finalAction: action,
          status: finalStatus,
          recoveredAmount,
          executionResult: simResult.outcome,
          riskScore: tx.riskScore,
        },
        { upsert: true, new: true }
      );

      await logAuditEvent({
        transactionId,
        action: 'RECOVERY_EXECUTED',
        reason: verResult.reason,
        executionResult: simResult.outcome,
        recoveredAmount,
      });
    } else if (action === 'ESCALATE') {
      await Transaction.updateOne({ transactionId }, { recoveryStatus: 'ESCALATED', status: 'ESCALATED' });
      finalStatus = 'ESCALATED';
      await logAuditEvent({ transactionId, action: 'ESCALATED', reason: 'Manual escalation to human review.' });
    } else {
      await Transaction.updateOne({ transactionId }, { recoveryStatus: 'BLOCKED', status: 'BLOCKED' });
      finalStatus = 'BLOCKED';
      await logAuditEvent({ transactionId, action: 'BLOCKED', reason: `Action ${action} applied.` });
    }

    res.json({ success: true, data: { transactionId, finalStatus, recoveredAmount, executionResult } });
  } catch (err) {
    next(err);
  }
}
