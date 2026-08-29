import { Request, Response, NextFunction } from 'express';
import Transaction from '../models/Transaction';

export async function getTransactions(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const {
      page = '1',
      limit = '20',
      search,
      status,
      risk,
      failureReason,
      paymentMethod,
      sort = '-timestamp',
      minAmount,
      maxAmount,
    } = req.query as Record<string, string | undefined>;

    const query: Record<string, unknown> = {};

    if (search) {
      query.$or = [
        { transactionId: { $regex: search, $options: 'i' } },
        { customerId: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
      ];
    }
    if (status) query.status = status;
    if (risk) query.riskLevel = risk;
    if (failureReason) query.failureReason = failureReason;
    if (paymentMethod) query.paymentMethod = paymentMethod;
    if (minAmount || maxAmount) {
      query.amount = {};
      if (minAmount) (query.amount as Record<string, number>).$gte = parseInt(minAmount, 10);
      if (maxAmount) (query.amount as Record<string, number>).$lte = parseInt(maxAmount, 10);
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, parseInt(limit, 10));

    const [transactions, total] = await Promise.all([
      Transaction.find(query)
        .sort(sort)
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      Transaction.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: {
        transactions,
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        limit: limitNum,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getTransactionById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const tx = await Transaction.findOne({ transactionId: req.params.id }).lean();
    if (!tx) {
      res.status(404).json({ success: false, error: 'Transaction not found' });
      return;
    }
    res.json({ success: true, data: tx });
  } catch (err) {
    next(err);
  }
}

export async function createTransaction(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const tx = new Transaction(req.body);
    await tx.save();
    res.status(201).json({ success: true, data: tx });
  } catch (err) {
    next(err);
  }
}
