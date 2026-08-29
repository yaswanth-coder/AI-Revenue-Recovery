import { Request, Response, NextFunction } from 'express';
import Transaction from '../models/Transaction';
import AgentDecision from '../models/AgentDecision';
import AuditLog from '../models/AuditLog';
import RecoveryCase from '../models/RecoveryCase';

export async function getDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const [
      recoveredAgg,
      atRiskAgg,
      totalTransactions,
      escalations,
      recentDecisions,
      recentActivity,
      agentDecisionsCount,
      activeCases,
      blockedCount,
    ] = await Promise.all([
      Transaction.aggregate([{ $group: { _id: null, total: { $sum: '$recoveredAmount' } } }]),
      Transaction.aggregate([
        { $match: { recoveryStatus: { $in: ['PENDING', 'FAILED'] } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Transaction.countDocuments(),
      Transaction.countDocuments({ recoveryStatus: 'ESCALATED' }),
      AgentDecision.find().sort({ createdAt: -1 }).limit(8).lean(),
      AuditLog.find().sort({ timestamp: -1 }).limit(10).lean(),
      AgentDecision.countDocuments(),
      RecoveryCase.countDocuments({ status: { $in: ['PENDING', 'PROCESSING'] } }),
      RecoveryCase.countDocuments({ status: 'BLOCKED' }),
    ]);

    const revenueRecovered = recoveredAgg[0]?.total ?? 0;
    const revenueAtRisk = atRiskAgg[0]?.total ?? 0;
    const totalRevenue = revenueAtRisk + revenueRecovered;
    const recoveryRate = totalRevenue > 0
      ? parseFloat(((revenueRecovered / totalRevenue) * 100).toFixed(1))
      : 0;

    res.json({
      success: true,
      data: {
        kpis: {
          revenueAtRisk,
          revenueRecovered,
          recoveryRate,
          activeCases,
          transactionsAnalyzed: totalTransactions,
          humanEscalations: escalations,
          agentDecisions: agentDecisionsCount,
          actionsBlocked: blockedCount,
        },
        recentDecisions,
        recentActivity,
      },
    });
  } catch (err) {
    next(err);
  }
}
