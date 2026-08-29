import express from 'express';
import { corsMiddleware } from './middleware/cors';
import { errorHandler } from './middleware/errorHandler';
import { connectDatabase } from './config/database';
import { config } from './config/env';
import {
  helmetSecurity,
  globalLimiter,
  sanitizeRequest,
  intrusionDetection,
} from './middleware/security';

// Routes
import transactionRoutes from './routes/transactions';
import dashboardRoutes from './routes/dashboard';
import recoveryCaseRoutes from './routes/recoveryCases';
import agentRoutes from './routes/agent';
import simulatorRoutes from './routes/simulator';
import analyticsRoutes from './routes/analytics';
import auditLogRoutes from './routes/auditLogs';
import policyRoutes from './routes/policies';
import authRoutes from './routes/auth';

const app = express();

// 1. Trust proxy for rate limiting behind reverse proxies (Nginx / Cloudflare / Load Balancers)
app.set('trust proxy', 1);

// 2. Enterprise HTTP Security Headers (Anti-Clickjacking, Anti-MIME sniffing, HSTS, CSP)
app.use(helmetSecurity);

// 3. Strict CORS Whitelist
app.use(corsMiddleware);

// 4. Bounded Payload Size (prevents memory exhaustion & buffer overflow attacks)
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// 5. Global Anti-DDoS Rate Limiting
app.use(globalLimiter);

// 6. Deep Input Sanitization (strips NoSQL injection $ operators and XSS script tags)
app.use(sanitizeRequest);

// 7. Real-Time WAF Intrusion Detection (intercepts SQLi, directory traversal, shell injection)
app.use(intrusionDetection);

// ── API Routes ──
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/recovery-cases', recoveryCaseRoutes);
app.use('/api/agent', agentRoutes);
app.use('/api/simulator', simulatorRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/audit-logs', auditLogRoutes);
app.use('/api/policies', policyRoutes);

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'RecoverAI API',
    securityStatus: 'HARDENED',
    timestamp: new Date().toISOString(),
    demo: config.demoMode,
    aiEnabled: !!config.aiApiKey,
  });
});

// Error handler must be last — sanitized error responses
app.use(errorHandler);

async function start() {
  await connectDatabase();
  app.listen(config.port, () => {
    console.log(`\n🤖 RecoverAI Enterprise Agent Server`);
    console.log(`   🛡️  Security: HARDENED (Helmet, CSP, NoSQL Sanitizer, Rate-Limiting, WAF Intrusion Detection)`);
    console.log(`   ✅ Running on port ${config.port}`);
    console.log(`   🗄️  Database: ${config.mongoUri}`);
    console.log(`   🔮 AI: ${config.aiApiKey ? `Enabled (${config.aiProvider})` : 'Deterministic Fallback'}`);
    console.log(`   🎭 Demo Mode: ${config.demoMode}\n`);
  });
}

start();
export default app;
