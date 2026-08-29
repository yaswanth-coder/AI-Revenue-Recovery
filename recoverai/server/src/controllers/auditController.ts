import { Request, Response, NextFunction } from 'express';
import AuditLog from '../models/AuditLog';

export async function getAuditLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const {
      page = '1',
      limit = '20',
      transactionId,
      action,
      result,
      startDate,
      endDate,
    } = req.query as Record<string, string | undefined>;

    const query: Record<string, unknown> = {};
    if (transactionId) query.transactionId = { $regex: transactionId, $options: 'i' };
    if (action) query.action = action;
    if (result) query.executionResult = result;
    if (startDate || endDate) {
      const dateQuery: Record<string, Date> = {};
      if (startDate) dateQuery.$gte = new Date(startDate);
      if (endDate) dateQuery.$lte = new Date(endDate);
      query.timestamp = dateQuery;
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, parseInt(limit, 10));

    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .sort({ timestamp: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      AuditLog.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: { logs, total, page: pageNum, pages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    next(err);
  }
}
