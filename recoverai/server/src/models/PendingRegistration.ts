import mongoose, { Schema, Document } from 'mongoose';

export interface IPendingRegistration extends Document {
  email: string;
  phone: string;
  name: string;
  passwordHash: string;
  persona: 'USER' | 'MAINTAINER';
  role: 'MERCHANT_FINANCE_USER' | 'FINANCE_LEAD' | 'PLATFORM_MAINTAINER' | 'SYSTEM_ADMIN';
  merchantName: string;
  department: string;
  phoneOtp: string;
  createdAt: Date;
  expiresAt: Date;
}

const PendingRegistrationSchema = new Schema<IPendingRegistration>(
  {
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    phone: { type: String, required: true, trim: true, index: true },
    name: { type: String, required: true },
    passwordHash: { type: String, required: true },
    persona: { type: String, enum: ['USER', 'MAINTAINER'], default: 'USER' },
    role: {
      type: String,
      enum: ['MERCHANT_FINANCE_USER', 'FINANCE_LEAD', 'PLATFORM_MAINTAINER', 'SYSTEM_ADMIN'],
      default: 'FINANCE_LEAD',
    },
    merchantName: { type: String, default: 'Acme Payments India' },
    department: { type: String, default: 'Treasury & Revenue Operations' },
    phoneOtp: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    // MongoDB TTL Index: automatically deletes unverified registrations after 15 minutes
    expiresAt: { type: Date, default: () => new Date(Date.now() + 15 * 60 * 1000), index: { expires: 0 } },
  },
  { timestamps: false }
);

export default mongoose.model<IPendingRegistration>('PendingRegistration', PendingRegistrationSchema);
