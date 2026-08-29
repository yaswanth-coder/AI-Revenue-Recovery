import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  eventId: string;
  transactionId: string;
  timestamp: Date;
  agent: string;
  action: string;
  reason: string;
  riskScore: number | null;
  policyResult: string | null;
  executionResult: string | null;
  recoveredAmount: number;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    eventId: { type: String, required: true, unique: true },
    transactionId: { type: String, required: true, index: true },
    timestamp: { type: Date, default: Date.now },
    agent: { type: String, default: 'RecoverAI-Agent' },
    action: { type: String, required: true },
    reason: { type: String, required: true },
    riskScore: { type: Number, default: null },
    policyResult: { type: String, default: null },
    executionResult: { type: String, default: null },
    recoveredAmount: { type: Number, default: 0 },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export default mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
