import { Request, Response, NextFunction } from 'express';
import Transaction from '../models/Transaction';
import AgentDecision from '../models/AgentDecision';
import RecoveryCase from '../models/RecoveryCase';

export async function getAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const [
      failureDistribution,
      recoveryByMethod,
      actionDistribution,
      dailyRecovery,
      riskDistribution,
      totals,
      recoveryStatusDist,
      blockedCount,
      escalatedCount,
      totalDecisions,
    ] = await Promise.all([
      Transaction.aggregate([
        { $group: { _id: '$failureReason', count: { $sum: 1 }, totalAmount: { $sum: '$amount' } } },
        { $sort: { count: -1 } },
      ]),
      Transaction.aggregate([
        {
          $group: {
            _id: '$paymentMethod',
            recovered: { $sum: '$recoveredAmount' },
            total: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
      ]),
      AgentDecision.aggregate([{ $group: { _id: '$finalAction', count: { $sum: 1 } } }]),
      Transaction.aggregate([
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
            atRisk: { $sum: '$amount' },
            recovered: { $sum: '$recoveredAmount' },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
        { $limit: 30 },
      ]),
      Transaction.aggregate([
        { $group: { _id: '$riskLevel', count: { $sum: 1 } } },
      ]),
      Transaction.aggregate([
        {
          $group: {
            _id: null,
            totalAtRisk: { $sum: '$amount' },
            totalRecovered: { $sum: '$recoveredAmount' },
            totalTransactions: { $sum: 1 },
          },
        },
      ]),
      Transaction.aggregate([
        { $group: { _id: '$recoveryStatus', count: { $sum: 1 } } },
      ]),
      RecoveryCase.countDocuments({ status: 'BLOCKED' }),
      Transaction.countDocuments({ recoveryStatus: 'ESCALATED' }),
      AgentDecision.countDocuments(),
    ]);

    const t = totals[0] ?? { totalAtRisk: 0, totalRecovered: 0, totalTransactions: 0 };
    const totalRevenue = t.totalAtRisk + t.totalRecovered;
    const recoveryRate = totalRevenue > 0
      ? parseFloat(((t.totalRecovered / totalRevenue) * 100).toFixed(1))
      : 0;

    res.json({
      success: true,
      data: {
        failureDistribution,
        recoveryByMethod,
        actionDistribution,
        dailyRecovery,
        riskDistribution,
        recoveryStatusDist,
        totals: { ...t, recoveryRate },
        blockedActions: blockedCount,
        escalations: escalatedCount,
        totalDecisions,
        policyBlockRate: totalDecisions > 0
          ? parseFloat(((blockedCount / totalDecisions) * 100).toFixed(1))
          : 0,
        escalationRate: totalDecisions > 0
          ? parseFloat(((escalatedCount / totalDecisions) * 100).toFixed(1))
          : 0,
      },
    });
  } catch (err) {
    next(err);
  }
}
