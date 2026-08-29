import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logAuditEvent } from '../services/auditService';

const JWT_SECRET = process.env.JWT_SECRET || 'recoverai_enterprise_secret_key_994883_fintech_guard';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  persona: 'USER' | 'MAINTAINER';
  merchantName: string;
}

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

/**
 * Generate a tamper-proof cryptographic JWT token with 24-hour validity
 */
export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '24h',
    algorithm: 'HS256',
    issuer: 'RecoverAI-Auth-Authority',
  });
}

/**
 * Verify and decode an incoming JWT token
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET, { issuer: 'RecoverAI-Auth-Authority' }) as TokenPayload;
  } catch {
    return null;
  }
}

/**
 * Middleware: Verify Authentication Token
 */
export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // In dev / demo fallback mode, allow pass-through if headers not present,
    // but tag as anonymous demo user
    if (process.env.NODE_ENV !== 'production') {
      req.user = {
        userId: 'demo_operator',
        email: 'devraj.roy@recoverai.internal',
        role: 'PLATFORM_MAINTAINER',
        persona: 'MAINTAINER',
        merchantName: 'RecoverAI Platform',
      };
      return next();
    }

    res.status(401).json({
      success: false,
      error: 'UNAUTHORIZED: Authentication token is required. Please login with OTP.',
    });
    return;
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    res.status(401).json({
      success: false,
      error: 'INVALID_TOKEN: Your session token is invalid or expired. Please re-authenticate.',
    });
    return;
  }

  req.user = decoded;
  next();
}

/**
 * Middleware: Server-Side Operator Authorization Guard
 * Prevents non-operators / Admin users from triggering retries, running simulator,
 * updating policies, or overriding AI risk decisions.
 */
export function requireOperator(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const user = req.user;

  if (!user) {
    res.status(401).json({ success: false, error: 'UNAUTHORIZED: Authentication required.' });
    return;
  }

  // Operator check: persona must be MAINTAINER or role must be PLATFORM_MAINTAINER / FINANCE_LEAD
  const isOperator =
    user.persona === 'MAINTAINER' ||
    user.role === 'PLATFORM_MAINTAINER' ||
    user.role === 'FINANCE_LEAD';

  if (!isOperator) {
    logAuditEvent({
      transactionId: `UNAUTH_ACTION_${Date.now()}`,
      agent: 'RecoverAI-RBAC-Guard',
      action: 'UNAUTHORIZED_ACCESS_BLOCKED',
      reason: `User ${user.email} (Role: ${user.role}, Persona: ${user.persona}) attempted forbidden Operator endpoint ${req.method} ${req.originalUrl}`,
      metadata: { userId: user.userId, url: req.originalUrl, method: req.method },
    }).catch(() => {});

    res.status(403).json({
      success: false,
      error: 'FORBIDDEN_OPERATOR_REQUIRED: This action requires Operator (Maintainer) privileges. Read-only Admin access cannot perform this operation.',
    });
    return;
  }

  next();
}
