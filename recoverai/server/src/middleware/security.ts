import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { logAuditEvent } from '../services/auditService';

/**
 * 1. Enterprise Helmet Security Headers
 * - Clickjacking prevention (X-Frame-Options: DENY)
 * - MIME-type sniffing protection (X-Content-Type-Options: nosniff)
 * - Strict Transport Security (HSTS)
 * - Cross-Site Scripting filter (X-XSS-Protection)
 * - Content Security Policy (CSP)
 */
export const helmetSecurity = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Allowed for Vite dev/Three.js bundles
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
      imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
      connectSrc: ["'self'", 'http://localhost:*', 'ws://localhost:*', 'https://generativelanguage.googleapis.com'],
      frameAncestors: ["'none'"], // Prevent clickjacking
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: 'deny' },
  hidePoweredBy: true, // Do not expose "X-Powered-By: Express"
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  ieNoOpen: true,
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xssFilter: true,
});

/**
 * 2. Rate Limiters
 */

// Global API rate limiter — prevents API flooding & DDoS
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 600, // max 600 requests per 15 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'SECURITY_RATE_LIMIT_EXCEEDED: Too many requests from this IP. Please try again in a few minutes.',
  },
});

// Strict Auth / OTP Request Rate Limiter — prevents SMS/Email bombing attacks
export const authOtpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 8, // max 8 OTP requests per 10 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'SECURITY_OTP_RATE_LIMIT: Too many OTP dispatch requests. For security reasons, please wait 10 minutes.',
  },
});

// Strict OTP Verification Rate Limiter — prevents brute-force 6-digit guessing attacks
export const authVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // max 15 verification attempts per 15 min per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'SECURITY_VERIFY_RATE_LIMIT: Maximum verification attempts exceeded. Account access temporarily protected.',
  },
});

/**
 * 3. Deep Sanitization Middleware — Defense against NoSQL Injection & XSS
 * - Strips MongoDB query operators ($gt, $ne, $where, $regex, etc.)
 * - Neutralizes malicious HTML / JavaScript payload tags (<script>, javascript:, eval)
 */
function sanitizeValue(value: unknown): unknown {
  if (value === null || value === undefined) return value;

  if (typeof value === 'string') {
    // Neutralize dangerous script injection patterns
    return value
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/data:text\/html/gi, '')
      .trim();
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (typeof value === 'object') {
    const cleanObj: Record<string, unknown> = {};
    for (const key of Object.keys(value as Record<string, unknown>)) {
      // Strip NoSQL injection keys that start with '$' or contain '.'
      if (key.startsWith('$') || key.includes('.')) {
        continue;
      }
      cleanObj[key] = sanitizeValue((value as Record<string, unknown>)[key]);
    }
    return cleanObj;
  }

  return value;
}

export function sanitizeRequest(req: Request, _res: Response, next: NextFunction): void {
  if (req.body) {
    req.body = sanitizeValue(req.body);
  }
  if (req.query) {
    req.query = sanitizeValue(req.query) as any;
  }
  if (req.params) {
    req.params = sanitizeValue(req.params) as any;
  }
  next();
}

/**
 * 4. Intrusion Detection & Threat Logging Middleware
 * Intercepts known attack patterns (SQLi, path traversal, shell injection)
 */
export function intrusionDetection(req: Request, res: Response, next: NextFunction): void {
  const url = req.originalUrl || req.url;
  const rawBody = JSON.stringify(req.body || {});

  const attackPatterns = [
    /(\.\.\/|\.\.\\)/i, // Path traversal
    /(<script|%3Cscript)/i, // Reflected XSS
    /(union\s+select|select\s+.*\s+from|insert\s+into|drop\s+table)/i, // SQL Injection
    /(\$where|\$ne|\$gt|\$regex)/i, // NoSQL Injection in raw string
    /(;\s*rm\s+|;\s*cat\s+|;\s*wget\s+|;\s*curl\s+)/i, // Command injection
  ];

  for (const pattern of attackPatterns) {
    if (pattern.test(url) || pattern.test(rawBody)) {
      // Log security intrusion attempt in immutable audit log
      logAuditEvent({
        transactionId: `SEC_INTRUSION_${Date.now()}`,
        agent: 'RecoverAI-WAF-Defense',
        action: 'SECURITY_THREAT_BLOCKED',
        reason: `Malicious payload detected and blocked: ${pattern.toString()}`,
        metadata: {
          ip: req.ip || req.socket.remoteAddress,
          url,
          method: req.method,
          threatPattern: pattern.toString(),
        },
      }).catch(() => {});

      res.status(403).json({
        success: false,
        error: 'SECURITY_ACCESS_DENIED: Suspicious payload or malicious pattern detected. This incident has been logged.',
      });
      return;
    }
  }

  next();
}
