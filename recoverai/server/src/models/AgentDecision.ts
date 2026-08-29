import mongoose, { Schema, Document } from 'mongoose';
import { RecoveryAction, PolicyResult } from '../types';

export interface IAgentDecision extends Document {
  decisionId: string;
  transactionId: string;
  timestamp: Date;
  failureReason: string;
  riskScore: number;
  recoveryProbability: number;
  amount: number;
  previousFailures: number;
  customerHistory: string;
  aiRecommendedAction: RecoveryAction;
  policyResult: PolicyResult;
  policyReason: string;
  finalAction: RecoveryAction;
  explanation: string;
  aiUsed: boolean;
  createdAt: Date;
}

const AgentDecisionSchema = new Schema<IAgentDecision>(
  {
    decisionId: { type: String, required: true, unique: true },
    transactionId: { type: String, required: true, index: true },
    timestamp: { type: Date, default: Date.now },
    failureReason: { type: String, required: true },
    riskScore: { type: Number, required: true },
    recoveryProbability: { type: Number, required: true },
    amount: { type: Number, required: true },
    previousFailures: { type: Number, required: true },
    customerHistory: { type: String, required: true },
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
    explanation: { type: String, required: true },
    aiUsed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<IAgentDecision>('AgentDecision', AgentDecisionSchema);
