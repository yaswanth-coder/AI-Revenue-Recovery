import mongoose, { Schema, Document } from 'mongoose';
import { RecoveryAction, PolicyResult, RecoveryStatus } from '../types';

export interface IRecoveryCase extends Document {
  caseId: string;
  transactionId: string;
  customerId: string;
  amount: number;
  aiRecommendedAction: RecoveryAction;
  policyResult: PolicyResult;
  policyReason: string;
  finalAction: RecoveryAction;
  status: RecoveryStatus;
  recoveredAmount: number;
  executionResult: string | null;
  riskScore: number;
  createdAt: Date;
  updatedAt: Date;
}

const RecoveryCaseSchema = new Schema<IRecoveryCase>(
  {
    caseId: { type: String, required: true, unique: true },
    transactionId: { type: String, required: true, index: true },
    customerId: { type: String, required: true },
    amount: { type: Number, required: true },
    aiRecommendedAction: {
      type: String,
      enum: ['RETRY', 'SEND_REMINDER', 'CHANGE_PAYMENT_METHOD', 'ESCALATE', 'BLOCK', 'NO_ACTION'],
      required: true,
    },
    policyResult: {
      type: String,
      enum: ['ALLOWED', 'BLOCKED', 'REQUIRES_APPROVAL'],
      required: true,
    },
    policyReason: { type: String, required: true },
    finalAction: {
      type: String,
      enum: ['RETRY', 'SEND_REMINDER', 'CHANGE_PAYMENT_METHOD', 'ESCALATE', 'BLOCK', 'NO_ACTION'],
      required: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'PROCESSING', 'RECOVERED', 'FAILED', 'ESCALATED', 'BLOCKED'],
      default: 'PENDING',
    },
    recoveredAmount: { type: Number, default: 0 },
    executionResult: { type: String, default: null },
    riskScore: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IRecoveryCase>('RecoveryCase', RecoveryCaseSchema);
