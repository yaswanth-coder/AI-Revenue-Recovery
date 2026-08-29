import { v4 as uuidv4 } from 'uuid';
import AuditLog, { IAuditLog } from '../models/AuditLog';

export interface AuditEvent {
  transactionId: string;
  agent?: string;
  action: string;
  reason: string;
  riskScore?: number;
  policyResult?: string;
  executionResult?: string;
  recoveredAmount?: number;
  metadata?: Record<string, unknown>;
}

export async function logAuditEvent(event: AuditEvent): Promise<IAuditLog> {
  const log = new AuditLog({
    eventId: uuidv4(),
    transactionId: event.transactionId,
    agent: event.agent || 'RecoverAI-Agent',
    action: event.action,
    reason: event.reason,
    riskScore: event.riskScore ?? null,
    policyResult: event.policyResult ?? null,
    executionResult: event.executionResult ?? null,
    recoveredAmount: event.recoveredAmount ?? 0,
    metadata: event.metadata ?? {},
    timestamp: new Date(),
  });
  return log.save();
}
