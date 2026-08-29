import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  Mail,
  Phone,
  Lock,
  ShieldCheck,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  Wrench,
  Users,
  Eye,
  EyeOff,
  UserPlus,
  LogIn,
  Smartphone,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

type AuthMode = 'PASSWORD_LOGIN' | 'CREATE_ACCOUNT' | 'OTP_LOGIN';
type PersonaType = 'OPERATOR' | 'ADMIN';
type RegStep = 'FORM' | 'VERIFY_PHONE';

const COUNTRY_CODES = [
  { code: '+91', country: 'IN', label: 'India (+91)' },
  { code: '+1', country: 'US', label: 'US / Canada (+1)' },
  { code: '+44', country: 'UK', label: 'UK (+44)' },
  { code: '+65', country: 'SG', label: 'Singapore (+65)' },
  { code: '+971', country: 'AE', label: 'UAE (+971)' },
];

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { loginWithPassword, createAccount, verifyPhoneOtp, resendPhoneOtp, sendOtp, verifyOtp, loading } = useAuth();

  // Mode switcher: Password Login, Create Account, or OTP Login
  const [authMode, setAuthMode] = useState<AuthMode>('PASSWORD_LOGIN');
  const [selectedPersona, setSelectedPersona] = useState<PersonaType>('OPERATOR');

  // Password Login Fields
  const [loginEmailOrPhone, setLoginEmailOrPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register / Create Account Fields
  const [regStep, setRegStep] = useState<RegStep>('FORM');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regCountryCode, setRegCountryCode] = useState('+91');
  const [regPhoneNumber, setRegPhoneNumber] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regPersona, setRegPersona] = useState<PersonaType>('OPERATOR');
  const [regOrg, setRegOrg] = useState('');
  const [regVerifyDigits, setRegVerifyDigits] = useState(['', '', '', '', '', '']);
  const [regVerifyLoading, setRegVerifyLoading] = useState(false);
  const [pendingRedirectUrl, setPendingRedirectUrl] = useState('');
  const regVerifyRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Direct SMS OTP Login Fields
  const [otpStep, setOtpStep] = useState<'DETAILS' | 'CODE'>('DETAILS');
  const [otpCountryCode, setOtpCountryCode] = useState('+91');
  const [otpPhoneNumber, setOtpPhoneNumber] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (authMode === 'OTP_LOGIN' && otpStep === 'CODE' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [authMode, otpStep, countdown]);

  // 1. Handle Password Login
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!loginEmailOrPhone || !loginPassword) {
      setStatusMessage({ type: 'error', text: 'Please enter your email/phone and password.' });
      return;
    }

    const res = await loginWithPassword(loginEmailOrPhone, loginPassword);
    if (res.success) {
      const targetUrl = res.redirectUrl || (selectedPersona === 'OPERATOR' ? '/dashboard' : '/admin');
      setStatusMessage({
        type: 'success',
        text: `Authenticated! Entering console...`,
      });
      setTimeout(() => {
        navigate(targetUrl);
      }, 100);
    } else {
      setStatusMessage({ type: 'error', text: res.message });
    }
  };

  // 2. Handle Create Account & Dispatch Phone OTP
  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    const cleanPhoneDigits = regPhoneNumber.replace(/[^0-9]/g, '');
    const fullPhone = `${regCountryCode}${cleanPhoneDigits}`;

    if (!regName || !regEmail || !cleanPhoneDigits || !regPassword) {
      setStatusMessage({ type: 'error', text: 'Please complete all required fields.' });
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setStatusMessage({ type: 'error', text: 'Passwords do not match. Please verify.' });
      return;
    }

    if (regPassword.length < 6) {
      setStatusMessage({ type: 'error', text: 'Password must be at least 6 characters long.' });
      return;
    }

    const res = await createAccount({
      name: regName,
      email: regEmail,
      phone: fullPhone,
      password: regPassword,
      persona: regPersona === 'OPERATOR' ? 'MAINTAINER' : 'USER',
      merchantName: regOrg || (regPersona === 'OPERATOR' ? 'Platform Engineering' : 'Acme Payments India'),
      department: regPersona === 'OPERATOR' ? 'Core Systems & AI Engineering' : 'Treasury & Revenue Operations',
    });

    if (res.success) {
      const targetUrl = res.redirectUrl || (regPersona === 'OPERATOR' ? '/dashboard' : '/admin');
      setPendingRedirectUrl(targetUrl);
      // Move to Step 2: Phone OTP Verification
      setRegStep('VERIFY_PHONE');
      setRegVerifyDigits(['', '', '', '', '', '']);
      setStatusMessage({
        type: 'success',
        text: `Verification code sent to ${fullPhone}. Please enter the 6-digit code.`,
      });
      setTimeout(() => regVerifyRefs.current[0]?.focus(), 80);
    } else {
      setStatusMessage({ type: 'error', text: res.message });
    }
  };

  // 2b. Handle Phone OTP Verification to create user in Mongo & sign in
  const handleVerifyRegPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);
    const enteredCode = regVerifyDigits.join('');

    if (enteredCode.length < 6) {
      setStatusMessage({ type: 'error', text: 'Please enter all 6 digits of the OTP code.' });
      return;
    }

    const fullPhone = `${regCountryCode}${regPhoneNumber.replace(/[^0-9]/g, '')}`;

    setRegVerifyLoading(true);
    try {
      const res = await verifyPhoneOtp(fullPhone, enteredCode, regEmail);
      if (res.success) {
        setStatusMessage({ type: 'success', text: 'Phone verified! Account created successfully. Entering dashboard...' });
        const destination = res.redirectUrl || pendingRedirectUrl || (regPersona === 'OPERATOR' ? '/dashboard' : '/admin');
        setTimeout(() => navigate(destination), 120);
      } else {
        setStatusMessage({ type: 'error', text: res.message });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err?.response?.data?.error || 'Invalid or expired OTP code.' });
    } finally {
      setRegVerifyLoading(false);
    }
  };

  // 2c. Resend Phone Registration OTP
  const handleResendRegPhoneCode = async () => {
    setStatusMessage(null);
    const fullPhone = `${regCountryCode}${regPhoneNumber.replace(/[^0-9]/g, '')}`;
    try {
      const res = await resendPhoneOtp(fullPhone, regEmail);
      if (res.success) {
        setStatusMessage({ type: 'success', text: `New 6-digit OTP code dispatched to ${fullPhone}.` });
      } else {
        setStatusMessage({ type: 'error', text: res.message });
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'Failed to resend. Please try again.' });
    }
  };

  // Inline OTP input handler for registration
  const handleRegVerifyOtpChange = (index: number, val: string) => {
    const clean = val.replace(/[^0-9]/g, '');
    const newDigits = [...regVerifyDigits];
    if (clean.length > 1) {
      const pasted = clean.slice(0, 6).split('');
      pasted.forEach((d, idx) => {
        newDigits[idx] = d;
      });
      setRegVerifyDigits(newDigits);
      regVerifyRefs.current[Math.min(pasted.length, 5)]?.focus();
      return;
    }
    newDigits[index] = clean;
    setRegVerifyDigits(newDigits);
    if (clean && index < 5) regVerifyRefs.current[index + 1]?.focus();
  };

  const handleRegVerifyKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !regVerifyDigits[index] && index > 0) {
      regVerifyRefs.current[index - 1]?.focus();
    }
  };

  // 3. Direct SMS OTP Login
  const handleSendDirectOtp = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setStatusMessage(null);

    const cleanPhoneDigits = otpPhoneNumber.replace(/[^0-9]/g, '');
    const fullPhone = `${otpCountryCode}${cleanPhoneDigits}`;

    if (!cleanPhoneDigits) {
      setStatusMessage({ type: 'error', text: 'Please enter your mobile phone number.' });
      return;
    }

    try {
      const res = await sendOtp(fullPhone);
      if (res.success) {
        setOtpStep('CODE');
        setCountdown(60);
        setCanResend(false);
        setStatusMessage({
          type: 'success',
          text: `OTP dispatched to ${fullPhone}. Valid for 10 minutes.`,
        });
        setTimeout(() => otpInputRefs.current[0]?.focus(), 80);
      } else {
        setStatusMessage({ type: 'error', text: res.message });
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.response?.data?.error || 'Failed to dispatch OTP code. Please check your inputs.',
      });
    }
  };

  const handleOtpChange = (index: number, val: string) => {
    const clean = val.replace(/[^0-9]/g, '');
    const newDigits = [...otpDigits];

    if (clean.length > 1) {
      const pasted = clean.slice(0, 6).split('');
      pasted.forEach((d, idx) => {
        newDigits[idx] = d;
      });
      setOtpDigits(newDigits);
      otpInputRefs.current[Math.min(pasted.length, 5)]?.focus();
      return;
    }

    newDigits[index] = clean;
    setOtpDigits(newDigits);

    if (clean && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // 4. Verify Direct Phone OTP Login
  const handleVerifyDirectOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    const enteredOtp = otpDigits.join('');
    if (enteredOtp.length < 6) {
      setStatusMessage({ type: 'error', text: 'Please enter all 6 digits of the OTP code.' });
      return;
    }

    const fullPhone = `${otpCountryCode}${otpPhoneNumber.replace(/[^0-9]/g, '')}`;
    const res = await verifyPhoneOtp(fullPhone, enteredOtp);

    if (res.success) {
      const targetUrl = res.redirectUrl || (selectedPersona === 'OPERATOR' ? '/dashboard' : '/admin');
      setStatusMessage({
        type: 'success',
        text: `Verified! Entering dashboard...`,
      });
      setTimeout(() => {
        navigate(targetUrl);
      }, 100);
    } else {
      setStatusMessage({ type: 'error', text: res.message });
    }
  };

  return (
    <div className="min-h-screen bg-background text-slate-100 flex flex-col justify-between selection:bg-emerald-500/30 selection:text-emerald-200">
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="max-w-md w-full glass-card p-6 sm:p-8 border-emerald-900/50 shadow-2xl relative overflow-hidden"
        >
          {/* Ambient Glow */}
          <div className="absolute -top-16 -right-16 w-36 h-36 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

          {/* Logo & Header */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-black font-black text-xl shadow-glow-md mb-2.5">
              <Zap className="w-7 h-7 fill-black text-black" />
            </div>
            <h1 className="text-2xl font-bold font-sans text-white">
              Recover<span className="text-emerald-400">AI</span> Console
            </h1>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              Bank-Grade AI Revenue Recovery Platform
            </p>
          </div>

          {/* Top Auth Mode Tabs */}
          <div className="flex p-1 bg-background-surface border border-background-border rounded-xl mb-5 text-[11px]">
            <button
              type="button"
              onClick={() => {
                setAuthMode('PASSWORD_LOGIN');
                setStatusMessage(null);
              }}
              className={`flex-1 py-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all ${
                authMode === 'PASSWORD_LOGIN'
                  ? 'bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" /> Sign In
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMode('CREATE_ACCOUNT');
                setStatusMessage(null);
                setRegStep('FORM');
              }}
              className={`flex-1 py-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all ${
                authMode === 'CREATE_ACCOUNT'
                  ? 'bg-purple-950/80 border border-purple-500/60 text-purple-300 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" /> Register
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMode('OTP_LOGIN');
                setStatusMessage(null);
                setOtpStep('DETAILS');
              }}
              className={`flex-1 py-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all ${
                authMode === 'OTP_LOGIN'
                  ? 'bg-blue-950/80 border border-blue-500/60 text-blue-300 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" /> Phone OTP
            </button>
          </div>

          {/* Status Message Notification */}
          <AnimatePresence>
            {statusMessage && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className={`p-3 rounded-xl text-xs font-medium mb-4 border flex items-start gap-2 ${
                  statusMessage.type === 'success'
                    ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300'
                    : 'bg-red-950/60 border-red-500/60 text-red-300'
                }`}
              >
                {statusMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <Lock className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                )}
                <span>{statusMessage.text}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ══════════════════════════════════════════════════════
              MODE 1: REAL PASSWORD SIGN IN
          ══════════════════════════════════════════════════════ */}
          {authMode === 'PASSWORD_LOGIN' && (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              {/* Email / Phone Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Work Email or Mobile Phone Number
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={loginEmailOrPhone}
                    onChange={(e) => setLoginEmailOrPhone(e.target.value)}
                    placeholder="name@company.com or phone number"
                    className="w-full bg-background-surface border border-background-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full bg-background-surface border border-background-border rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3 text-xs font-bold uppercase tracking-wider shadow-glow-sm flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <RotateCcw className="w-4 h-4 animate-spin" />
                    Authenticating Credentials...
                  </>
                ) : (
                  <>
                    Sign In to Console <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-between pt-2 text-xs text-slate-400">
                <button
                  type="button"
                  onClick={() => setAuthMode('OTP_LOGIN')}
                  className="hover:text-emerald-300 transition-colors"
                >
                  Sign in with Phone OTP &rarr;
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('CREATE_ACCOUNT');
                    setRegStep('FORM');
                  }}
                  className="text-emerald-400 hover:underline font-semibold"
                >
                  Create New Account
                </button>
              </div>
            </form>
          )}

          {/* ══════════════════════════════════════════════════════
              MODE 2: REAL ACCOUNT REGISTRATION (Phone OTP 2-Step)
          ══════════════════════════════════════════════════════ */}
          {authMode === 'CREATE_ACCOUNT' && (
            <AnimatePresence mode="wait">
              {regStep === 'FORM' ? (
                <motion.form
                  key="reg-form"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  onSubmit={handleCreateAccount}
                  className="space-y-3"
                >
                  {/* Account Type */}
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">Select Account Type:</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setRegPersona('OPERATOR')}
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                          regPersona === 'OPERATOR'
                            ? 'bg-purple-950/60 border-purple-500 text-purple-200'
                            : 'bg-background-surface border-background-border text-slate-400'
                        }`}
                      >
                        <Wrench className="w-4 h-4 text-purple-400 shrink-0" />
                        <div>
                          <div className="text-xs font-bold text-white">Operator</div>
                          <div className="text-[9px] text-purple-300">Full Access (/dashboard)</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setRegPersona('ADMIN')}
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                          regPersona === 'ADMIN'
                            ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200'
                            : 'bg-background-surface border-background-border text-slate-400'
                        }`}
                      >
                        <Users className="w-4 h-4 text-emerald-400 shrink-0" />
                        <div>
                          <div className="text-xs font-bold text-white">Admin / User</div>
                          <div className="text-[9px] text-emerald-300">Read-Only (/admin)</div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Full Name */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="e.g. Karan Malhotra"
                      className="w-full bg-background-surface border border-background-border rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Work Email */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">Work Email</label>
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full bg-background-surface border border-background-border rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 font-mono text-[11px]"
                    />
                  </div>

                  {/* Mobile Phone Number */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center justify-between">
                      <span>Mobile Phone Number</span>
                      <span className="text-[10px] text-emerald-400 font-mono">OTP will be sent via SMS</span>
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={regCountryCode}
                        onChange={(e) => setRegCountryCode(e.target.value)}
                        className="bg-background-surface border border-background-border rounded-xl px-2 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                      >
                        {COUNTRY_CODES.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.code} ({c.country})
                          </option>
                        ))}
                      </select>
                      <input
                        type="tel"
                        required
                        value={regPhoneNumber}
                        onChange={(e) => setRegPhoneNumber(e.target.value)}
                        placeholder="98765 43210"
                        className="flex-1 bg-background-surface border border-background-border rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 font-mono text-[11px]"
                      />
                    </div>
                  </div>

                  {/* Organization */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">Organization / Merchant</label>
                    <input
                      type="text"
                      value={regOrg}
                      onChange={(e) => setRegOrg(e.target.value)}
                      placeholder="e.g. Acme Payments India"
                      className="w-full bg-background-surface border border-background-border rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 text-[11px]"
                    />
                  </div>

                  {/* Password & Confirm */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">Password</label>
                      <input
                        type="password"
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Min 6 chars"
                        className="w-full bg-background-surface border border-background-border rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">Confirm</label>
                      <input
                        type="password"
                        required
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        placeholder="Repeat"
                        className="w-full bg-background-surface border border-background-border rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>
                  </div>

                  {/* Submit CTA */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full py-2.5 text-xs font-bold uppercase tracking-wider mt-2 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <RotateCcw className="w-4 h-4 animate-spin" />
                        Sending Phone OTP...
                      </>
                    ) : (
                      <>
                        Get Phone OTP &amp; Create Account &rarr;
                      </>
                    )}
                  </button>
                </motion.form>
              ) : (
                /* ── STEP 2: Phone OTP Verification ── */
                <motion.form
                  key="reg-phone-verify"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  onSubmit={handleVerifyRegPhoneOtp}
                  className="space-y-5"
                >
                  {/* Header */}
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-950/60 border border-emerald-500/60 flex items-center justify-center mb-3">
                      <Smartphone className="w-6 h-6 text-emerald-400" />
                    </div>
                    <h3 className="text-sm font-bold text-white mb-1">Verify Your Mobile Number</h3>
                    <p className="text-xs text-slate-400">
                      Enter the 6-digit OTP code sent via SMS to:
                    </p>
                    <p className="font-mono text-xs font-bold text-emerald-400 mt-0.5">
                      {regCountryCode} {regPhoneNumber}
                    </p>
                  </div>

                  {/* 6-digit code inputs */}
                  <div className="flex justify-center gap-2">
                    {regVerifyDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => (regVerifyRefs.current[idx] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleRegVerifyOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleRegVerifyKeyDown(idx, e)}
                        className="w-11 h-12 bg-background-surface border border-background-border rounded-xl text-center font-mono text-lg font-bold text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                      />
                    ))}
                  </div>

                  {/* Verify CTA */}
                  <button
                    type="submit"
                    disabled={regVerifyLoading}
                    className="btn-primary w-full py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
                  >
                    {regVerifyLoading ? (
                      <>
                        <RotateCcw className="w-4 h-4 animate-spin" />
                        Verifying Phone OTP...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Confirm &amp; Create Profile
                      </>
                    )}
                  </button>

                  {/* Resend + Back row */}
                  <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-background-border">
                    <button
                      type="button"
                      onClick={() => {
                        setRegStep('FORM');
                        setStatusMessage(null);
                      }}
                      className="hover:text-slate-200 transition-colors"
                    >
                      &larr; Back to Form
                    </button>
                    <button
                      type="button"
                      onClick={handleResendRegPhoneCode}
                      className="text-emerald-400 hover:underline font-semibold"
                    >
                      Resend SMS Code
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          )}

          {/* ══════════════════════════════════════════════════════
              MODE 3: DIRECT PHONE SMS OTP LOGIN
          ══════════════════════════════════════════════════════ */}
          {authMode === 'OTP_LOGIN' && (
            <div className="space-y-4">
              {otpStep === 'DETAILS' ? (
                <form onSubmit={handleSendDirectOtp} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Mobile Phone Number
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={otpCountryCode}
                        onChange={(e) => setOtpCountryCode(e.target.value)}
                        className="bg-background-surface border border-background-border rounded-xl px-2.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                      >
                        {COUNTRY_CODES.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.code} ({c.country})
                          </option>
                        ))}
                      </select>
                      <div className="relative flex-1">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type="tel"
                          required
                          value={otpPhoneNumber}
                          onChange={(e) => setOtpPhoneNumber(e.target.value)}
                          placeholder="98765 43210"
                          className="w-full bg-background-surface border border-background-border rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <RotateCcw className="w-4 h-4 animate-spin" />
                        Dispatching SMS OTP...
                      </>
                    ) : (
                      <>
                        Get SMS OTP Code <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyDirectOtp} className="space-y-4">
                  <div className="text-center">
                    <span className="text-xs text-slate-400">Enter the 6-digit code sent via SMS to:</span>
                    <div className="font-mono text-xs font-bold text-emerald-400 mt-0.5">
                      {otpCountryCode} {otpPhoneNumber}
                    </div>
                  </div>

                  {/* 6 Digit Input Boxes */}
                  <div className="flex justify-center gap-2">
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => (otpInputRefs.current[idx] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        className="w-11 h-12 bg-background-surface border border-background-border rounded-xl text-center font-mono text-lg font-bold text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                      />
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <RotateCcw className="w-4 h-4 animate-spin" />
                        Verifying Code...
                      </>
                    ) : (
                      <>
                        Verify OTP &amp; Enter Dashboard <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-background-border">
                    <button
                      type="button"
                      onClick={() => {
                        setOtpStep('DETAILS');
                        setStatusMessage(null);
                      }}
                      className="hover:text-slate-200"
                    >
                      &larr; Change Details
                    </button>
                    <div>
                      {canResend ? (
                        <button type="button" onClick={handleSendDirectOtp} className="text-emerald-400 hover:underline font-semibold">
                          Resend Code
                        </button>
                      ) : (
                        <span className="font-mono text-slate-500">Resend in {countdown}s</span>
                      )}
                    </div>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Security Badge Footer */}
          <div className="mt-5 pt-4 border-t border-background-border/80 text-center text-[10px] text-slate-500 font-mono flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Multi-Factor E.164 SMS Authentication</span>
          </div>
        </motion.div>
      </div>

      <footer className="py-3 text-center text-xs text-slate-500 font-mono border-t border-background-border">
        RecoverAI &bull; Autonomous AI Revenue Recovery Platform
      </footer>
    </div>
  );
};
