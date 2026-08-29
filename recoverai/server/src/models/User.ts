import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserPersona = 'USER' | 'MAINTAINER';

export interface IUser extends Document {
  email: string;
  phone: string;
  name: string;
  persona: UserPersona;
  role: 'MERCHANT_FINANCE_USER' | 'FINANCE_LEAD' | 'PLATFORM_MAINTAINER' | 'SYSTEM_ADMIN';
  merchantName: string;
  department: string;
  avatar: string;
  passwordHash: string | null;
  otp: string | null;
  otpExpiresAt: Date | null;
  emailOtp: string | null;
  emailOtpExpiresAt: Date | null;
  phoneOtp: string | null;
  phoneOtpExpiresAt: Date | null;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  failedLoginAttempts: number;
  lockUntil: Date | null;
  lastLogin: Date | null;
  preferences: {
    autoRetryNotifications: boolean;
    escalationAlerts: boolean;
    smsAlerts: boolean;
    emailReports: 'DAILY' | 'WEEKLY' | 'REALTIME';
    webhookUrl: string;
    aiConfidenceThreshold: number;
  };
  payoutAccount: {
    bankName: string;
    accountNumber: string;
    ifscCode: string;
  };
  maintainerSettings: {
    aiModel: string;
    circuitBreakerActive: boolean;
    telemetryLevel: 'DEBUG' | 'INFO' | 'WARN';
    logRetentionDays: number;
    workerNodes: number;
  };
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    phone: { type: String, required: true, trim: true, index: true },
    name: { type: String, default: 'Finance Operations Lead' },
    persona: {
      type: String,
      enum: ['USER', 'MAINTAINER'],
      default: 'USER',
    },
    role: {
      type: String,
      enum: ['MERCHANT_FINANCE_USER', 'FINANCE_LEAD', 'PLATFORM_MAINTAINER', 'SYSTEM_ADMIN'],
      default: 'FINANCE_LEAD',
    },
    merchantName: { type: String, default: 'Acme Payments India' },
    department: { type: String, default: 'Treasury & Revenue Operations' },
    avatar: { type: String, default: '' },
    passwordHash: { type: String, default: null },
    otp: { type: String, default: null },
    otpExpiresAt: { type: Date, default: null },
    emailOtp: { type: String, default: null },
    emailOtpExpiresAt: { type: Date, default: null },
    phoneOtp: { type: String, default: null },
    phoneOtpExpiresAt: { type: Date, default: null },
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date, default: null },
    lastLogin: { type: Date, default: null },
    preferences: {
      autoRetryNotifications: { type: Boolean, default: true },
      escalationAlerts: { type: Boolean, default: true },
      smsAlerts: { type: Boolean, default: false },
      emailReports: { type: String, enum: ['DAILY', 'WEEKLY', 'REALTIME'], default: 'DAILY' },
      webhookUrl: { type: String, default: 'https://api.acmepayments.in/v1/webhooks/recoverai' },
      aiConfidenceThreshold: { type: Number, default: 75 },
    },
    payoutAccount: {
      bankName: { type: String, default: 'HDFC Bank Ltd.' },
      accountNumber: { type: String, default: '•••• •••• 8291' },
      ifscCode: { type: String, default: 'HDFC0001234' },
    },
    maintainerSettings: {
      aiModel: { type: String, default: 'gemini-pro / deterministic' },
      circuitBreakerActive: { type: Boolean, default: true },
      telemetryLevel: { type: String, enum: ['DEBUG', 'INFO', 'WARN'], default: 'INFO' },
      logRetentionDays: { type: Number, default: 90 },
      workerNodes: { type: Number, default: 4 },
    },
  },
  { timestamps: true }
);

UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.passwordHash) return false;
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

export default mongoose.model<IUser>('User', UserSchema);
