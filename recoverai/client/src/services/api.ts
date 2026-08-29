import axios from 'axios';
import {
  KPIStats,
  Transaction,
  AgentDecision,
  AuditLog,
  RecoveryCase,
  Policy,
  SimulationResponse,
  AnalyticsData,
} from '../types';

const API_BASE_URL = '/api';

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Secure Token Interceptor — automatically attaches cryptographic JWT Bearer header
client.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('recoverai_auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // ignore
  }
  return config;
});

export const api = {
  // Generic helpers
  post: async (path: string, body: unknown) => {
    const res = await client.post<{ success: boolean; message: string; data: any }>(path, body);
    return res.data;
  },

  put: async (path: string, body: unknown) => {
    const res = await client.put<{ success: boolean; message: string; data: any }>(path, body);
    return res.data;
  },

  // Password Authentication
  loginWithPassword: async (emailOrPhone: string, password: string) => {
    const res = await client.post<{
      success: boolean;
      message: string;
      data: {
        user: any;
        token: string;
        redirectUrl: string;
      };
    }>('/auth/login-password', { emailOrPhone, password });
    return res.data;
  },

  createAccount: async (payload: {
    name: string;
    email: string;
    phone: string;
    password: string;
    persona: 'USER' | 'MAINTAINER';
    merchantName?: string;
    department?: string;
  }) => {
    const res = await client.post<{
      success: boolean;
      message: string;
      data?: {
        email?: string;
        user?: any;
        token?: string;
        redirectUrl?: string;
      };
    }>('/auth/register', payload);
    return res.data;
  },

  changePassword: async (payload: { email: string; currentPassword?: string; newPassword: string }) => {
    const res = await client.post<{ success: boolean; message: string }>('/auth/change-password', payload);
    return res.data;
  },

  // Phone & SMS OTP
  sendOtp: async (phone: string, email?: string, channel?: 'SMS' | 'EMAIL' | 'BOTH') => {
    const res = await client.post<{
      success: boolean;
      message: string;
      data: {
        email?: string;
        phone: string;
        persona?: string;
        expiresAt: string;
        carrier?: string;
        refId?: string;
      };
    }>('/auth/send-otp', { phone, email, channel });
    return res.data;
  },

  // Phone Registration OTP Verification
  verifyPhoneOtp: async (phone: string, otp: string, email?: string) => {
    const res = await client.post<{
      success: boolean;
      message: string;
      data: {
        user?: any;
        token?: string;
        redirectUrl?: string;
        isPhoneVerified?: boolean;
      };
    }>('/auth/verify-phone-otp', { phone, otp, email });
    return res.data;
  },

  resendPhoneOtp: async (phone: string, email?: string) => {
    const res = await client.post<{
      success: boolean;
      message: string;
      data: { phone: string; expiresAt: string };
    }>('/auth/resend-phone-otp', { phone, email });
    return res.data;
  },

  getLiveNotifications: async () => {
    const res = await client.get<{
      success: boolean;
      data: Array<{
        id: string;
        channel: 'SMS' | 'EMAIL';
        recipient: string;
        maskedRecipient: string;
        subject?: string;
        message: string;
        otpCode: string;
        timestamp: string;
        carrierOrProvider: string;
        deliveryStatus: string;
      }>;
    }>('/auth/live-notifications');
    return res.data.data;
  },

  verifyOtp: async (email: string, phone: string, otp: string) => {
    const res = await client.post<{
      success: boolean;
      message: string;
      data: {
        user: {
          id: string;
          name: string;
          email: string;
          phone: string;
          persona: 'USER' | 'MAINTAINER';
          role: string;
          merchantName: string;
          department: string;
          lastLogin: string;
          preferences?: any;
          payoutAccount?: any;
          maintainerSettings?: any;
        };
        token: string;
      };
    }>('/auth/verify-otp', { email, phone, otp });
    return res.data;
  },

  getMe: async () => {
    const res = await client.get<{ success: boolean; data: { user: any } }>('/auth/me');
    return res.data.data;
  },

  updateProfile: async (payload: unknown) => {
    const res = await client.put<{ success: boolean; message: string; data: any }>('/auth/profile', payload);
    return res.data;
  },

  getSecurityStatus: async () => {
    const res = await client.get<{ success: boolean; data: any }>('/auth/security-status');
    return res.data.data;
  },

  // Dashboard
  getDashboard: async () => {
    const res = await client.get<{
      success: boolean;
      data: {
        kpis: KPIStats;
        recentDecisions: AgentDecision[];
        recentActivity: AuditLog[];
      };
    }>('/dashboard');
    return res.data.data;
  },

  // Transactions
  getTransactions: async (params?: Record<string, unknown>) => {
    const res = await client.get<{
      success: boolean;
      data: {
        transactions: Transaction[];
        total: number;
        page: number;
        pages: number;
        limit: number;
      };
    }>('/transactions', { params });
    return res.data.data;
  },

  getTransactionById: async (id: string) => {
    const res = await client.get<{
      success: boolean;
      data: Transaction;
    }>(`/transactions/${id}`);
    return res.data.data;
  },

  // Agent
  getAgentStatus: async () => {
    const res = await client.get<{
      success: boolean;
      data: {
        status: string;
        decisionsTotal: number;
        actionsExecuted: number;
        actionsBlocked: number;
        escalations: number;
        revenueRecovered: number;
        transactionsAnalyzed: number;
      };
    }>('/agent/status');
    return res.data.data;
  },

  analyzeTransaction: async (transactionId: string) => {
    const res = await client.post<{
      success: boolean;
      data: {
        decision: unknown;
        agentDecision: AgentDecision;
        explanation: string;
        aiUsed: boolean;
      };
    }>('/agent/analyze', { transactionId });
    return res.data.data;
  },

  executeRecovery: async (transactionId: string, action: string) => {
    const res = await client.post<{
      success: boolean;
      data: {
        transactionId: string;
        finalStatus: string;
        recoveredAmount: number;
        executionResult: string;
      };
    }>('/agent/recover', { transactionId, action });
    return res.data.data;
  },

  // Simulator
  runSimulation: async (payload: {
    amount: number;
    paymentMethod: string;
    failureReason: string;
    previousFailures: number;
    customerHistory: string;
    transactionAgeMinutes?: number;
  }) => {
    const res = await client.post<{
      success: boolean;
      data: SimulationResponse;
    }>('/simulator/run', payload);
    return res.data.data;
  },

  // Analytics
  getAnalytics: async () => {
    const res = await client.get<{
      success: boolean;
      data: AnalyticsData;
    }>('/analytics');
    return res.data.data;
  },

  // Audit Logs
  getAuditLogs: async (params?: Record<string, unknown>) => {
    const res = await client.get<{
      success: boolean;
      data: {
        logs: AuditLog[];
        total: number;
        page: number;
        pages: number;
      };
    }>('/audit-logs', { params });
    return res.data.data;
  },

  // Policies
  getPolicies: async () => {
    const res = await client.get<{
      success: boolean;
      data: Policy[];
    }>('/policies');
    return res.data.data;
  },

  updatePolicy: async (id: string, value: unknown, enabled: boolean) => {
    const res = await client.put<{
      success: boolean;
      data: Policy;
    }>(`/policies/${id}`, { value, enabled });
    return res.data.data;
  },

  resetPolicies: async () => {
    const res = await client.put<{
      success: boolean;
      data: Policy[];
      message: string;
    }>('/policies/reset');
    return res.data.data;
  },

  // Recovery Cases
  getRecoveryCases: async (params?: Record<string, unknown>) => {
    const res = await client.get<{
      success: boolean;
      data: {
        cases: RecoveryCase[];
        total: number;
        page: number;
        pages: number;
      };
    }>('/recovery-cases', { params });
    return res.data.data;
  },
};

// Currency formatter utility
export function formatINR(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '₹0';
  return '₹' + amount.toLocaleString('en-IN');
}

// Compact currency formatter for charts/KPIs (e.g. ₹5.91L, ₹8.42L, ₹2.5K)
export function formatINRCompact(amount: number): string {
  if (!amount) return '₹0';
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)}Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)}L`;
  }
  if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}k`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
}
