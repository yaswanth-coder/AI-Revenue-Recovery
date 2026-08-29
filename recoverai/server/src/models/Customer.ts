import mongoose, { Schema, Document } from 'mongoose';
import { CustomerHistory } from '../types';

export interface ICustomer extends Document {
  customerId: string;
  name: string;
  email: string;
  history: CustomerHistory;
  totalTransactions: number;
  failedTransactions: number;
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema = new Schema<ICustomer>(
  {
    customerId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    history: {
      type: String,
      enum: ['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'NEW'],
      default: 'GOOD',
    },
    totalTransactions: { type: Number, default: 0 },
    failedTransactions: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model<ICustomer>('Customer', CustomerSchema);
