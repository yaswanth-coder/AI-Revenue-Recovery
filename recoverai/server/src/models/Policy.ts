import mongoose, { Schema, Document } from 'mongoose';

export interface IPolicy extends Document {
  policyId: string;
  name: string;
  description: string;
  key: string;
  value: number | boolean | string;
  type: 'number' | 'boolean' | 'string';
  enabled: boolean;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

const PolicySchema = new Schema<IPolicy>(
  {
    policyId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    key: { type: String, required: true, unique: true },
    value: { type: Schema.Types.Mixed, required: true },
    type: { type: String, enum: ['number', 'boolean', 'string'], required: true },
    enabled: { type: Boolean, default: true },
    category: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IPolicy>('Policy', PolicySchema);
