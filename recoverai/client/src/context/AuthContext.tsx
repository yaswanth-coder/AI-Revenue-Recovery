import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

export interface UserPreferences {
  autoRetryNotifications: boolean;
  escalationAlerts: boolean;
  smsAlerts: boolean;
  emailReports: 'DAILY' | 'WEEKLY' | 'REALTIME';
  webhookUrl: string;
  aiConfidenceThreshold: number;
}

export interface PayoutAccount {
  bankName: string;
  accountNumber: string;
  ifscCode: string;
}

export interface MaintainerSettings {
  aiModel: string;
  circuitBreakerActive: boolean;
  telemetryLevel: 'DEBUG' | 'INFO' | 'WARN';
  logRetentionDays: number;
  workerNodes: number;
}

export interface UserProfile {
  id?: string;
  name: string;
  email: string;
  phone: string;
  persona: 'USER' | 'MAINTAINER';
  role: string;
  merchantName: string;
  department: string;
  lastLogin?: string;
  preferences?: UserPreferences;
  payoutAccount?: PayoutAccount;
  maintainerSettings?: MaintainerSettings;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  loading: boolean;
  loginWithPassword: (emailOrPhone: string, password: string) => Promise<{ success: boolean; message: string; redirectUrl?: string }>;
  createAccount: (payload: {
    name: string;
    email: string;
    phone: string;
    password: string;
    persona: 'USER' | 'MAINTAINER';
    merchantName?: string;
    department?: string;
  }) => Promise<{ success: boolean; message: string; redirectUrl?: string }>;
  changePassword: (payload: { email: string; currentPassword?: string; newPassword: string }) => Promise<{ success: boolean; message: string }>;
  sendOtp: (phone: string, email?: string) => Promise<{ success: boolean; message: string }>;
  verifyOtp: (phone: string, otp: string) => Promise<{ success: boolean; message: string; redirectUrl?: string }>;
  verifyPhoneOtp: (phone: string, otp: string, email?: string) => Promise<{ success: boolean; message: string; redirectUrl?: string }>;
  resendPhoneOtp: (phone: string, email?: string) => Promise<{ success: boolean; message: string }>;
  updateUser: (updates: Partial<UserProfile>) => void;
  switchPersona: (persona: 'USER' | 'MAINTAINER') => Promise<{ success: boolean; message: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'recoverai_auth_user';

const DEFAULT_USER: UserProfile = {
  name: 'Arjun Sharma',
  email: 'arjun.sharma@acmepayments.in',
  phone: '+91 98765 43210',
  persona: 'USER',
  role: 'FINANCE_LEAD',
  merchantName: 'Acme Payments India',
  department: 'Treasury & Revenue Operations',
  preferences: {
    autoRetryNotifications: true,
    escalationAlerts: true,
    smsAlerts: false,
    emailReports: 'DAILY',
    webhookUrl: 'https://api.acmepayments.in/v1/webhooks/recoverai',
    aiConfidenceThreshold: 75,
  },
  payoutAccount: {
    bankName: 'HDFC Bank Ltd.',
    accountNumber: '•••• •••• 8291',
    ifscCode: 'HDFC0001234',
  },
  maintainerSettings: {
    aiModel: 'gemini-pro / deterministic',
    circuitBreakerActive: true,
    telemetryLevel: 'INFO',
    logRetentionDays: 90,
    workerNodes: 4,
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) return JSON.parse(cached);
    } catch {
      // ignore
    }
    return null;
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const loginWithPassword = async (emailOrPhone: string, password: string) => {
    setLoading(true);
    try {
      const res = await api.loginWithPassword(emailOrPhone, password);
      if (res.success && res.data?.user) {
        const u = res.data.user as UserProfile;
        if (res.data.token) {
          localStorage.setItem('recoverai_auth_token', res.data.token);
        }
        if (!u.preferences) u.preferences = DEFAULT_USER.preferences;
        if (!u.payoutAccount) u.payoutAccount = DEFAULT_USER.payoutAccount;
        if (!u.maintainerSettings) u.maintainerSettings = DEFAULT_USER.maintainerSettings;
        setUser(u);
        return {
          success: true,
          message: res.message,
          redirectUrl: res.data.redirectUrl || (u.persona === 'MAINTAINER' ? '/dashboard' : '/admin'),
        };
      }
      return { success: false, message: 'Authentication failed.' };
    } catch (err: any) {
      return {
        success: false,
        message: err?.response?.data?.error || 'Invalid credentials entered.',
      };
    } finally {
      setLoading(false);
    }
  };

  const createAccount = async (payload: {
    name: string;
    email: string;
    phone: string;
    password: string;
    persona: 'USER' | 'MAINTAINER';
    merchantName?: string;
    department?: string;
  }) => {
    setLoading(true);
    try {
      const res = await api.createAccount(payload);
      if (res.success) {
        if (res.data?.user) {
          const u = res.data.user as UserProfile;
          if (res.data.token) {
            localStorage.setItem('recoverai_auth_token', res.data.token);
          }
          if (!u.preferences) u.preferences = DEFAULT_USER.preferences;
          if (!u.payoutAccount) u.payoutAccount = DEFAULT_USER.payoutAccount;
          if (!u.maintainerSettings) u.maintainerSettings = DEFAULT_USER.maintainerSettings;
          setUser(u);
        }
        return {
          success: true,
          message: res.message,
          redirectUrl: res.data?.redirectUrl || (payload.persona === 'MAINTAINER' ? '/dashboard' : '/admin'),
        };
      }
      return { success: false, message: res.message || 'Account creation failed.' };
    } catch (err: any) {
      return {
        success: false,
        message: err?.response?.data?.error || 'Failed to create account.',
      };
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (payload: { email: string; currentPassword?: string; newPassword: string }) => {
    setLoading(true);
    try {
      const res = await api.changePassword(payload);
      return { success: res.success, message: res.message };
    } catch (err: any) {
      return {
        success: false,
        message: err?.response?.data?.error || 'Failed to change password.',
      };
    } finally {
      setLoading(false);
    }
  };

  const sendOtp = async (phone: string, email?: string) => {
    setLoading(true);
    try {
      const res = await api.sendOtp(phone, email);
      return {
        success: res.success,
        message: res.message,
      };
    } catch (err: any) {
      return {
        success: false,
        message: err?.response?.data?.error || 'Failed to dispatch OTP. Please check your inputs.',
      };
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (phone: string, otp: string) => {
    setLoading(true);
    try {
      const res = await api.verifyOtp('', phone, otp);
      if (res.success && res.data?.user) {
        const u = res.data.user as UserProfile;
        if (res.data?.token) {
          localStorage.setItem('recoverai_auth_token', res.data.token);
        }
        if (!u.preferences) u.preferences = DEFAULT_USER.preferences;
        if (!u.payoutAccount) u.payoutAccount = DEFAULT_USER.payoutAccount;
        if (!u.maintainerSettings) u.maintainerSettings = DEFAULT_USER.maintainerSettings;
        setUser(u);
        return {
          success: true,
          message: res.message,
          redirectUrl: u.persona === 'MAINTAINER' ? '/dashboard' : '/admin',
        };
      }
      return { success: false, message: 'Verification failed.' };
    } catch (err: any) {
      return {
        success: false,
        message: err?.response?.data?.error || 'Invalid OTP code entered.',
      };
    } finally {
      setLoading(false);
    }
  };

  const verifyPhoneOtp = async (phone: string, otp: string, email?: string) => {
    setLoading(true);
    try {
      const res = await api.verifyPhoneOtp(phone, otp, email);
      if (res.success && res.data?.user) {
        const u = res.data.user as UserProfile;
        if (res.data?.token) {
          localStorage.setItem('recoverai_auth_token', res.data.token);
        }
        if (!u.preferences) u.preferences = DEFAULT_USER.preferences;
        if (!u.payoutAccount) u.payoutAccount = DEFAULT_USER.payoutAccount;
        if (!u.maintainerSettings) u.maintainerSettings = DEFAULT_USER.maintainerSettings;
        setUser(u);
        return {
          success: true,
          message: res.message,
          redirectUrl: u.persona === 'MAINTAINER' ? '/dashboard' : '/admin',
        };
      }
      return { success: false, message: res.message || 'Verification failed.' };
    } catch (err: any) {
      return {
        success: false,
        message: err?.response?.data?.error || 'Invalid or expired OTP code.',
      };
    } finally {
      setLoading(false);
    }
  };

  const resendPhoneOtp = async (phone: string, email?: string) => {
    setLoading(true);
    try {
      const res = await api.resendPhoneOtp(phone, email);
      return { success: res.success, message: res.message };
    } catch (err: any) {
      return {
        success: false,
        message: err?.response?.data?.error || 'Failed to resend OTP code.',
      };
    } finally {
      setLoading(false);
    }
  };

  const updateUser = (updates: Partial<UserProfile>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : prev));
  };

  const switchPersona = async (persona: 'USER' | 'MAINTAINER') => {
    if (!user?.email) return { success: false, message: 'Not authenticated' };
    setLoading(true);
    try {
      const res = await api.post('/auth/switch-persona', { email: user.email, persona });
      if (res.success && res.data?.user) {
        const u = res.data.user as UserProfile;
        if (!u.preferences) u.preferences = DEFAULT_USER.preferences;
        if (!u.payoutAccount) u.payoutAccount = DEFAULT_USER.payoutAccount;
        if (!u.maintainerSettings) u.maintainerSettings = DEFAULT_USER.maintainerSettings;
        setUser(u);
      } else {
        const isMaintainer = persona === 'MAINTAINER';
        setUser((prev) =>
          prev
            ? {
                ...prev,
                persona,
                role: isMaintainer ? 'PLATFORM_MAINTAINER' : 'FINANCE_LEAD',
                merchantName: isMaintainer ? 'RecoverAI Platform Infrastructure' : 'Acme Payments India',
                department: isMaintainer ? 'Core Systems & AI Engineering' : 'Treasury & Revenue Operations',
              }
            : prev
        );
      }
      return { success: true, message: `Switched to ${persona} persona.` };
    } catch {
      const isMaintainer = persona === 'MAINTAINER';
      setUser((prev) =>
        prev
          ? {
              ...prev,
              persona,
              role: isMaintainer ? 'PLATFORM_MAINTAINER' : 'FINANCE_LEAD',
              merchantName: isMaintainer ? 'RecoverAI Platform Infrastructure' : 'Acme Payments India',
              department: isMaintainer ? 'Core Systems & AI Engineering' : 'Treasury & Revenue Operations',
            }
          : prev
      );
      return { success: true, message: `Switched to ${persona} persona (local).` };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('recoverai_auth_token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        loginWithPassword,
        createAccount,
        changePassword,
        sendOtp,
        verifyOtp,
        verifyPhoneOtp,
        resendPhoneOtp,
        updateUser,
        switchPersona,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
