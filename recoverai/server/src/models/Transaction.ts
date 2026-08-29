import mongoose, { Schema, Document } from 'mongoose';
import {
  FailureReason, PaymentMethod, TransactionStatus,
  RecoveryAction, RecoveryStatus, RiskLevel, CustomerHistory
} from '../types';

export interface ITransaction extends Document {
  transactionId: string;
  customerId: string;
  customerName: string;
  amount: number;
  currency: string;
  timestamp: Date;
  paymentMethod: PaymentMethod;
  status: TransactionStatus;
  failureReason: FailureReason;
  failureCount: number;
  customerHistory: CustomerHistory;
  riskScore: number;
  riskLevel: RiskLevel;
  recoveryProbability: number;
  recommendedAction: RecoveryAction;
  actualAction: RecoveryAction | null;
  recoveryStatus: RecoveryStatus;
  recoveredAmount: number;
  policyResult: string | null;
  isDemo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    transactionId: { type: String, required: true, unique: true, index: true },
    customerId: { type: String, required: true, index: true },
    customerName: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    timestamp: { type: Date, required: true, index: true },
    paymentMethod: {
      type: String,
      enum: ['CREDIT_CARD', 'DEBIT_CARD', 'NET_BANKING', 'UPI', 'WALLET'],
      required: true,
    },
    status: {
      type: String,
      enum: ['FAILED', 'RECOVERED', 'PENDING', 'BLOCKED', 'ESCALATED'],
      default: 'FAILED',
      index: true,
    },
    failureReason: {
      type: String,
      enum: [
        'BANK_TIMEOUT', 'INSUFFICIENT_FUNDS', 'CARD_DECLINED', 'NETWORK_ERROR',
        'AUTHENTICATION_FAILURE', 'EXPIRED_CARD', 'LIMIT_EXCEEDED', 'UNKNOWN_ERROR',
      ],
      required: true,
    },
    failureCount: { type: Number, default: 1 },
    customerHistory: {
      type: String,
      enum: ['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'NEW'],
      default: 'GOOD',
    },
    riskScore: { type: Number, required: true, index: true },
    riskLevel: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'], required: true },
    recoveryProbability: { type: Number, required: true },
    recommendedAction: {
      type: String,
      enum: ['RETRY', 'SEND_REMINDER', 'CHANGE_PAYMENT_METHOD', 'ESCALATE', 'BLOCK', 'NO_ACTION'],
      required: true,
    },
    actualAction: {
      type: String,
      enum: ['RETRY', 'SEND_REMINDER', 'CHANGE_PAYMENT_METHOD', 'ESCALATE', 'BLOCK', 'NO_ACTION', null],
      default: null,
    },
    recoveryStatus: {
      type: String,
      enum: ['PENDING', 'PROCESSING', 'RECOVERED', 'FAILED', 'ESCALATED', 'BLOCKED'],
      default: 'PENDING',
    },
    recoveredAmount: { type: Number, default: 0 },
    policyResult: { type: String, default: null },
    isDemo: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<ITransaction>('Transaction', TransactionSchema);
