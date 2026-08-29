<div align="center">

# ⚡ RecoverAI — Autonomous AI Revenue Recovery Platform

### *Bank-Grade Autonomous Intelligence for Failed Payment Recovery & Financial Leakage Prevention*

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18.x-026e00?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/React-18.x-61dafb?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178c6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-Mongoose-47a248?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-5.x-646cff?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.x-38bdf8?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Security-Hardened%20WAF-10b981?style=for-the-badge&logo=security&logoColor=white" />
  <img src="https://img.shields.io/badge/License-MIT-emerald?style=for-the-badge" />
</p>

[Quick Start](#-quick-start) · [Key Highlights](#-key-highlights) · [The 6 Agents](#-the-6-specialized-ai--decision-agents) · [Architecture](#%EF%B8%8F-architecture) · [Demo Scenarios](#-benchmark-demo-scenarios) · [Security Suite](#-bank-grade-security--anti-hacking-suite) · [API Reference](#-api-reference) · [Tech Stack](#%EF%B8%8F-tech-stack)

---

</div>

## 📌 Executive Summary

Digital merchants and payment gateways lose **2% to 7% of Gross Merchandise Value (GMV)** annually to failed transactions (bank timeouts, temporary network drops, limit declines, and card issuer errors). 

Traditional recovery mechanisms either **blindly retry** (causing high gateway fees and issuer fraud blocks) or rely on **slow manual reviews** (causing severe customer churn). 

**RecoverAI** solves this with **Bounded Autonomy**: combining predictive machine learning and generative reasoning to autonomously triage, score risk, recommend recovery tactics, and execute smart retries — while ensuring strict financial safety guardrails are **mathematically non-bypassable**.

---

## ✨ Key Highlights

* 🤖 **Autonomous AI Recovery Engine** — Intelligently assesses failed transactions in real time and recommends the optimal retry path (Gateway switch, smart backoff, fallback method).
* 🛡️ **Immutable Financial Policy Guardrails** — Hard limits (Max ₹50,000 auto-recovery, max 3 retry attempts, risk ceiling 70/100) that AI can never override.
* 📱 **Mobile Phone SMS OTP Authentication** — Passwordless and password-protected sign in with E.164 carrier routing (Airtel/Jio, Twilio, Vodafone, Singtel) and strict Phone OTP verification.
* 🔒 **Zero Profile Creation Before Verification** — User profiles are only created in MongoDB after successful SMS OTP verification. Staged data auto-expires in 15 minutes.
* 👥 **Role-Based Access Control (RBAC)** — Two tailored console views:
  * **Operator (Maintainer)**: Full control center, manual triggers, policy editing, risk overrides, simulator.
  * **Admin / User**: Read-only high-level analytics, transaction monitoring, recovery ledger.
* 📊 **Live 10,000+ Transaction Analytics** — Real-time velocity area charts, recovery rates, risk score distributions, and merchant volume breakdown.
* ⚡ **Interactive Gateway Simulator** — Test end-to-end recovery scenarios (`BANK_TIMEOUT`, `INSUFFICIENT_FUNDS`, `NETWORK_ERROR`, `SUSPECTED_FRAUD`) in a safe synthetic sandbox.
* 📜 **Cryptographic Audit Ledger** — Sealed, immutable log tracking every AI decision, policy evaluation, risk check, and transaction state change.
* 🌐 **Bank-Grade WAF & Security Hardening** — Helmet HTTP headers, NoSQL injection sanitizers, XSS neutralizers, anti-brute force lockout (5 failed attempts &rarr; 15m freeze), and multi-tier rate limiting.

---

## 🎯 Why This Project?

| Traditional Payment Recovery | RecoverAI Autonomous Platform |
| :--- | :--- |
| ❌ Blind naive retries trigger card network fraud flags | ✅ ML Risk Engine (0-100) computes recovery probability before attempting |
| ❌ Unbounded LLMs hallucinate financial transactions | ✅ **Bounded Autonomy**: Deterministic Policy Engine strictly overrides AI |
| ❌ Manual human triage takes 24–48 hours | ✅ Sub-second autonomous diagnosis and execution |
| ❌ No audit transparency for compliance audits | ✅ Tamper-evident immutable audit ledger for every transaction |
| ❌ Weak authentication prone to brute-force attacks | ✅ E.164 Phone SMS OTP + bcrypt hashing + 5-attempt security lockouts |

---

## 🤖 The 6 Specialized AI & Decision Agents

```
                        User / Transaction Failure Event
                                       │
                                       ▼
                       ┌──────────────────────────────┐
                       │   RecoverAI Agent Pipeline   │
                       └──────────────┬───────────────┘
                                      │
         ┌───────────────┬────────────┼───────────────┬───────────────┐
         │               │            │               │               │
         ▼               ▼            ▼               ▼               ▼
    📡 Ingestion   🔍 Diagnostic   🔮 Risk Engine   🤖 Recovery    🛡️ Policy Guard
        Agent           Agent        (ML Scoring)     Strategist      (Hard Limits)
                                                      (Gemini/Rules)
```

| Agent | Icon | Role & Functionality |
| :--- | :---: | :--- |
| **IngestionAgent** | 📡 | Listens to payment gateway webhooks (Stripe, Razorpay, PayU, Adyen) at sub-second latency and parses raw failure codes. |
| **DiagnosticAgent** | 🔍 | Categorizes root causes (`BANK_TIMEOUT`, `NETWORK_DROP`, `INSUFFICIENT_FUNDS`, `CARD_EXPIRED`, `FRAUD_FLAG`). |
| **RiskEngineAgent** | 🔮 | Calculates deterministic composite risk score (0 to 100) based on previous failures, customer velocity, and transaction size. |
| **RecoveryStrategistAgent** | 🤖 | Uses Generative AI (Gemini Pro) or deterministic fallback to determine optimal retry timing, route, and messaging. |
| **PolicyGuardAgent** | 🛡️ | Enforces immutable financial constraints. Blocks or escalates any AI action that breaches amount, risk, or retry bounds. |
| **VerificationAgent** | ⚡ | Validates synthetic gateway response, ensures idempotency, and seals records into the immutable audit ledger. |

---

## 🏛️ Architecture

```text
                                 FAILED TRANSACTION WEBHOOK
                                             │
                                             ▼
                             ┌───────────────────────────────┐
                             │    RecoverAI Ingestion Bus    │
                             └───────────────┬───────────────┘
                                             │
                                             ▼
                             ┌───────────────────────────────┐
                             │       Diagnostic Engine       │
                             │  (Root Cause Classification)  │
                             └───────────────┬───────────────┘
                                             │
                                             ▼
                             ┌───────────────────────────────┐
                             │    ML Risk Scoring (0-100)    │
                             └───────────────┬───────────────┘
                                             │
                                             ▼
                             ┌───────────────────────────────┐
                             │     AI Recovery Strategist    │
                             │   (Gemini Pro / Fallback)     │
                             └───────────────┬───────────────┘
                                             │
                                             ▼
                             ┌───────────────────────────────┐
                             │    POLICY GUARD ENGINE (👑)   │
                             │  • Risk Score <= 70           │
                             │  • Amount <= ₹50,000          │
                             │  • Retries <= 3               │
                             └───────────────┬───────────────┘
                                             │
                         ┌───────────────────┴───────────────────┐
                         │                                       │
                   [ALLOWED]                                 [BLOCKED]
                         │                                       │
                         ▼                                       ▼
            ┌─────────────────────────┐             ┌─────────────────────────┐
            │  Payment Simulator /    │             │  Escalate to Human /    │
            │  Gateway Retry Route    │             │  Block Fraud Incident   │
            └────────────┬────────────┘             └────────────┬────────────┘
                         │                                       │
                         └───────────────────┬───────────────────┘
                                             │
                                             ▼
                             ┌───────────────────────────────┐
                             │  Cryptographic Audit Ledger   │
                             │  (Tamper-Evident MongoDB Log) │
                             └───────────────────────────────┘
```

---

## 🛡️ Financial Guardrail Presets

| Guardrail Parameter | Limit / Condition | Enforcement Level | Breach Action |
| :--- | :--- | :--- | :--- |
| **Maximum Amount** | ₹50,000.00 | Strict Deterministic | Escalate to Human Lead |
| **Maximum Retries** | 3 attempts per transaction | Strict Idempotent | Mark Exhausted / Escalate |
| **Risk Score Ceiling** | 70 / 100 | Strict ML Bound | Immediate Fraud Block |
| **Time Window** | 24 Hours from initial failure | System Ceiling | Expire Case |
| **Idempotency Key** | `SHA-256(TxnID + Attempt)` | Cryptographic | Reject Duplicate Submissions |

---

## 🧪 Benchmark Demo Scenarios

| Scenario | Transaction ID | Amount | Failure Reason | Risk Score | AI Recommendation | Policy Result | Final Action | Outcome |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Scenario 1 (Auto-Recovered)** | `TXN_DEMO_001` | ₹2,499.00 | `BANK_TIMEOUT` | 18 (Low) | `SMART_RETRY` | **ALLOWED** | `RETRY` | ✅ **₹2,499 Recovered** |
| **Scenario 2 (Fraud Blocked)** | `TXN_DEMO_002` | ₹25,000.00 | `CARD_DECLINED` | 86 (High) | `RETRY` | **BLOCKED** | `ESCALATE` | 🛑 **Escalated / Blocked** |
| **Scenario 3 (High-Value)** | `TXN_DEMO_003` | ₹75,000.00 | `NETWORK_ERROR` | 35 (Med) | `SMART_RETRY` | **BLOCKED** | `HUMAN_APPROVAL` | 👤 **Requires Lead Signoff** |

---

## 🔐 Bank-Grade Security & Anti-Hacking Suite

| Security Layer | Implementation Details | Attack Vector Prevented |
| :--- | :--- | :--- |
| **HTTP Security Headers** | Helmet (`HSTS`, `CSP Whitelist`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`) | Clickjacking, MIME Confusion, Insecure Protocol Downgrade |
| **Anti-Injection Filter** | Deep recursive key sanitization stripping `$` and `.` MongoDB operators | NoSQL Injection & MongoDB Operator Tampering |
| **XSS Neutralizer** | Input tag sanitizer removing `<script>`, `javascript:`, and HTML entities | Reflected and Stored Cross-Site Scripting (XSS) |
| **WAF Interceptor** | Regex scanner detecting SQLi (`UNION SELECT`), Path Traversal (`../`), Shell | Remote Code Execution & Directory Traversal |
| **Multi-Tier Rate Limiting** | Global (600/15m), OTP Dispatch (8/10m), Auth Verification (15/15m) | DDoS, API Flooding, SMS / OTP Bombing |
| **Brute-Force Lockout** | 5 consecutive failed password/OTP entries &rarr; 15-min auto-lockout | Credential Stuffing & Dictionary Guessing |
| **Session Encryption** | HMAC-SHA256 Signed JWTs with 24-hour expiration | Token Tampering & Session Forgery |
| **Server-Side RBAC** | `requireOperator` middleware checking persona on sensitive routes | Privilege Escalation by Restricted Users |

---

## ⚡ Quick Start

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **npm**: v9.0.0 or higher
* **MongoDB**: v6.0 or higher (running locally or via MongoDB Atlas URI)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/yaswanth-coder/AI-Revenue-Recovery.git
cd AI-Revenue-Recovery/recoverai

# Install root, server, and client dependencies
npm run install:all
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Edit `.env`:
```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/recoverai

# Client
CLIENT_URL=http://localhost:5173

# Real Email Delivery (Optional)
SMTP_SERVICE=gmail
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password
SMTP_FROM="RecoverAI Security <noreply@recoverai.platform>"

# AI Engine (Optional - deterministic fallback active if unset)
AI_API_KEY=
AI_MODEL=gemini-pro
AI_PROVIDER=gemini

# System Mode
DEMO_MODE=false
```

### 3. Seed Database with 10,000+ Transactions
```bash
npm run seed
```

### 4. Start Full-Stack Application
```bash
npm run dev
```

* **Frontend Console**: [http://localhost:5173](http://localhost:5173)
* **Backend REST API**: [http://localhost:5000/api](http://localhost:5000/api)
* **Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 📂 Project Structure

```text
recoverai/
├── package.json                 # Monorepo scripts (dev, build, test, seed)
├── .env.example                 # Environment configuration template
├── README.md                    # Platform documentation
│
├── client/                      # Vite + React 18 + TypeScript Frontend
│   ├── src/
│   │   ├── components/          # Reusable UI widgets (KPICard, RiskGauge, TopBar, Sidebar, etc.)
│   │   ├── context/             # AuthContext (RBAC, JWT, Phone OTP handlers)
│   │   ├── layouts/             # AppLayout shell with navigation
│   │   ├── pages/               # LandingPage, Dashboard, Simulator, Transactions, Admin, Profile
│   │   ├── services/            # Axios API client with INR currency formatters
│   │   ├── types/               # TypeScript interfaces & domain models
│   │   ├── App.tsx              # React router & persona routing
│   │   └── main.tsx             # Application bootstrap
│   ├── tailwind.config.js       # Emerald & Dark Slate design system
│   └── vite.config.ts           # Vite build configuration
│
└── server/                      # Node.js + Express + TypeScript Backend
    ├── src/
    │   ├── config/              # MongoDB connection & env loaders
    │   ├── controllers/         # Auth, Transactions, Simulator, Analytics controllers
    │   ├── middleware/          # Security (Helmet, WAF, NoSQL Sanitizer, RBAC guards)
    │   ├── models/              # Mongoose schemas (User, PendingRegistration, Transaction, PolicyRule, AuditLog)
    │   ├── routes/              # Express API route declarations
    │   ├── scripts/             # seedDatabase.ts, clearUsers.ts, testEmail.ts
    │   ├── services/            # riskEngine, policyEngine, recoveryDecisionService, paymentSimulator, notificationService
    │   ├── tests/               # Jest automated business rules test suite
    │   └── index.ts             # Server entry point
    ├── jest.config.ts           # Jest test runner configuration
    └── tsconfig.json            # TypeScript server compiler options
```

---

## 🗄️ Database Schema & Models

### 1. `User` Model
```typescript
interface IUser {
  name: string;
  email: string;
  phone: string;
  passwordHash?: string;
  persona: 'USER' | 'MAINTAINER';
  role: 'MERCHANT_FINANCE_USER' | 'FINANCE_LEAD' | 'PLATFORM_MAINTAINER' | 'SYSTEM_ADMIN';
  merchantName: string;
  department: string;
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  failedLoginAttempts: number;
  lockUntil: Date | null;
  lastLogin: Date;
}
```

### 2. `PendingRegistration` Model (15-min TTL)
```typescript
interface IPendingRegistration {
  email: string;
  phone: string;
  name: string;
  passwordHash: string;
  persona: 'USER' | 'MAINTAINER';
  phoneOtp: string;
  expiresAt: Date; // Indexed with TTL: 0 (auto-deletes after 15 mins)
}
```

### 3. `Transaction` Model
```typescript
interface ITransaction {
  transactionId: string;
  merchantId: string;
  customerPhone: string;
  amount: number;
  currency: 'INR';
  status: 'SUCCESS' | 'FAILED' | 'RECOVERED' | 'BLOCKED' | 'PENDING';
  failureReason: 'BANK_TIMEOUT' | 'INSUFFICIENT_FUNDS' | 'NETWORK_ERROR' | 'CARD_EXPIRED' | 'FRAUD_FLAG';
  riskScore: number; // 0 to 100
  recoveryAttempts: number;
  recoveredAmount: number;
  idempotencyKey: string;
}
```

---

## 📡 API Reference

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/register` | Stage user registration & dispatch Phone SMS OTP | No |
| `POST` | `/api/auth/verify-phone-otp` | Verify 6-digit SMS OTP & create User Profile in MongoDB | No |
| `POST` | `/api/auth/resend-phone-otp` | Resend fresh 6-digit SMS OTP to mobile number | No |
| `POST` | `/api/auth/login-password` | Authenticate with Email/Phone + Encrypted Password | No |
| `POST` | `/api/auth/send-otp` | Dispatch direct login SMS OTP to phone | No |
| `POST` | `/api/auth/verify-otp` | Verify direct login SMS OTP and issue JWT | No |
| `GET` | `/api/dashboard/stats` | High-level recovery metrics & velocity KPIs | Yes |
| `GET` | `/api/transactions` | Query 10,000+ transaction dataset with filters | Yes |
| `POST` | `/api/simulator/execute` | Run synthetic gateway payment recovery simulation | Operator Only |
| `GET` | `/api/policies` | Retrieve active financial safety guardrails | Yes |
| `PUT` | `/api/policies/:id` | Modify financial guardrail thresholds | Operator Only |
| `GET` | `/api/audit-logs` | Query tamper-evident cryptographic audit ledger | Yes |
| `GET` | `/api/health` | Service health status & WAF security verification | No |

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | React 18 + Vite | Blazing fast client rendering & hot module replacement |
| **Language** | TypeScript 5.x | End-to-end type safety and domain models |
| **Styling & Design** | Tailwind CSS v3 | Custom dark emerald fintech design system |
| **Animations** | Framer Motion | Smooth 60 FPS micro-animations and page transitions |
| **3D Visualization** | Three.js | Interactive 3D revenue recovery neural network |
| **Backend Runtime** | Node.js + Express | High-throughput asynchronous REST API |
| **Database** | MongoDB + Mongoose | Scalable document store with TTL indexes |
| **Testing** | Jest + ts-jest | Automated regression testing for financial business rules |
| **Security Suite** | Helmet + express-rate-limit | Enterprise WAF, CORS whitelist, anti-brute force |
| **SMS Carrier Routing** | E.164 Gateway Dispatcher | Carrier routing (Airtel, Jio, Twilio, Vodafone, Singtel) |

---

## 🧪 Automated Testing

Execute the automated financial business rules test suite:

```bash
cd server
npm test
```

```text
PASS src/tests/businessRules.test.ts
  RecoverAI Core Business Rules Tests
    ✓ Test 1: BANK_TIMEOUT + low risk + 0 previous failures should recommend RETRY and allow policy (20 ms)
    ✓ Test 2: More than 3 previous failures should ESCALATE (1 ms)
    ✓ Test 3: Amount > ₹50,000 should require HUMAN APPROVAL / ESCALATE (1 ms)
    ✓ Test 4: Risk score > 70 cannot be automatically recovered and must be BLOCKED / ESCALATED (24 ms)
    ✓ Test 5: Successful payment simulation should verify and return recovered amount (258 ms)
    ✓ Test 6: Failed payment simulation should not increase recovered amount (253 ms)
    ✓ Test 7: Duplicate retry is prevented by Idempotency check (1 ms)

Test Suites: 1 passed, 1 total
Tests:       7 passed, 7 total
Time:        2.999 s
```

---

## 🗺️ Roadmap

- [x] Autonomous diagnosis & ML Risk Engine (0-100)
- [x] Bounded financial policy safety constraints (Max ₹50,000 limit)
- [x] Mobile Phone SMS OTP Verification (Zero DB profile before verify)
- [x] Role-Based Access Control (Operator vs Admin read-only)
- [x] Interactive 3D Three.js revenue network visualization
- [x] Synthetic Payment Gateway Simulator with outcome verification
- [x] Cryptographic tamper-evident audit ledger
- [ ] Multi-region webhook failover for international gateways
- [ ] WhatsApp Business API integration for interactive customer payment links
- [ ] Dynamic UPI Intent switch (auto-trigger Google Pay / PhonePe fallback)

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<div align="center">

**Built with ❤️ for Financial Integrity and Autonomous Intelligence**

© 2026 RecoverAI Platform · All Rights Reserved

</div>
