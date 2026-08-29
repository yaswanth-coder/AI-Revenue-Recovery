import { Request, Response, NextFunction } from 'express';
import Policy from '../models/Policy';

export async function getPolicies(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const policies = await Policy.find().sort({ category: 1, name: 1 }).lean();
    res.json({ success: true, data: policies });
  } catch (err) {
    next(err);
  }
}

export async function updatePolicy(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { value, enabled } = req.body as { value: unknown; enabled: boolean };

    const policy = await Policy.findOneAndUpdate(
      { policyId: id },
      { $set: { value, enabled } },
      { new: true }
    );

    if (!policy) {
      res.status(404).json({ success: false, error: 'Policy not found' });
      return;
    }

    res.json({ success: true, data: policy });
  } catch (err) {
    next(err);
  }
}

export async function resetPolicies(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const defaults = [
      { key: 'MAX_AUTO_RETRIES', value: 1 },
      { key: 'HIGH_VALUE_THRESHOLD', value: 50000 },
      { key: 'MAX_FAILURES_BEFORE_ESCALATION', value: 3 },
      { key: 'HIGH_RISK_THRESHOLD', value: 70 },
      { key: 'IDEMPOTENCY_CHECK', value: true },
    ];
    for (const d of defaults) {
      await Policy.updateOne({ key: d.key }, { $set: { value: d.value, enabled: true } });
    }
    const policies = await Policy.find().sort({ category: 1, name: 1 }).lean();
    res.json({ success: true, data: policies, message: 'Policies reset to defaults' });
  } catch (err) {
    next(err);
  }
}
