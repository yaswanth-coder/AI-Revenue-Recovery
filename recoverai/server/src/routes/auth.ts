import { Router } from 'express';
import {
  sendOtp,
  verifyOtp,
  getMe,
  updateProfile,
  switchPersona,
  getSecurityStatus,
  loginWithPassword,
  createAccount,
  changePassword,
  verifyPhoneOtpAndRegister,
  resendRegistrationPhoneOtp,
  getLiveNotifications,
} from '../controllers/authController';
import { authOtpLimiter, authVerifyLimiter } from '../middleware/security';

const router = Router();

// 1. Password Authentication
router.post('/login-password', authVerifyLimiter, loginWithPassword);
router.post('/change-password', changePassword);

// 2. Account Registration with Mobile Phone OTP Verification
router.post('/register', authOtpLimiter, createAccount);
router.post('/verify-phone-otp', authVerifyLimiter, verifyPhoneOtpAndRegister);
router.post('/resend-phone-otp', authOtpLimiter, resendRegistrationPhoneOtp);

// 3. Direct Phone SMS OTP Login
router.post('/send-otp', authOtpLimiter, sendOtp);
router.post('/verify-otp', authVerifyLimiter, verifyOtp);

// 4. Live Outbox (simulated dispatch inspection)
router.get('/live-notifications', getLiveNotifications);

// 5. User Profile & System Status
router.get('/me', getMe);
router.put('/profile', updateProfile);
router.post('/switch-persona', switchPersona);
router.get('/security-status', getSecurityStatus);

export default router;
