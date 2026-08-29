import { Request, Response, NextFunction } from 'express';
import RecoveryCase from '../models/RecoveryCase';

export async function getRecoveryCases(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { page = '1', limit = '20', status } = req.query as Record<string, string | undefined>;
    const query: Record<string, unknown> = {};
    if (status) query.status = status;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, parseInt(limit, 10));

    const [cases, total] = await Promise.all([
      RecoveryCase.find(query).sort({ createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum).lean(),
      RecoveryCase.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: { cases, total, page: pageNum, pages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    next(err);
  }
}
