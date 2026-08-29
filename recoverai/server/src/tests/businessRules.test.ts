import { calculateRisk } from '../services/riskEngine';
import { evaluatePolicy, DEFAULT_POLICIES } from '../services/policyEngine';
import { determineFallbackAction, makeRecoveryDecision } from '../services/recoveryDecisionService';
import { simulatePayment } from '../services/paymentSimulator';
import { verifyRecovery } from '../services/verificationService';

describe('RecoverAI Core Business Rules Tests', () => {
  // Test 1: BANK_TIMEOUT + low risk + zero previous failures -> RETRY
  test('Test 1: BANK_TIMEOUT + low risk + 0 previous failures should recommend RETRY and allow policy', async () => {
    const risk = calculateRisk({
      amount: 2499,
      failureReason: 'BANK_TIMEOUT',
      failureCount: 0,
      customerHistory: 'EXCELLENT',
      paymentMethod: 'UPI',
      transactionAgeMinutes: 5,
    });

    expect(risk.score).toBeLessThanOrEqual(30);
    expect(risk.level).toBe('LOW');

    const action = determineFallbackAction('BANK_TIMEOUT', risk.score, 0, risk.recoveryProbability);
    expect(action).toBe('RETRY');

    const policy = evaluatePolicy(
      {
        action,
        amount: 2499,
        riskScore: risk.score,
        failureCount: 0,
        transactionId: 'TXN_TEST_001',
      },
      DEFAULT_POLICIES
    );

    expect(policy.result).toBe('ALLOWED');
    expect(policy.finalAction).toBe('RETRY');
  });

  // Test 2: More than 3 previous failures -> ESCALATE
  test('Test 2: More than 3 previous failures should ESCALATE', () => {
    const policy = evaluatePolicy(
      {
        action: 'RETRY',
        amount: 5000,
        riskScore: 40,
        failureCount: 4, // > 3
        transactionId: 'TXN_TEST_002',
      },
      DEFAULT_POLICIES
    );

    expect(policy.result).toBe('BLOCKED');
    expect(policy.finalAction).toBe('ESCALATE');
    expect(policy.reason).toContain('exceeds maximum of 3');
  });

  // Test 3: Amount > ₹50,000 -> HUMAN APPROVAL / ESCALATE
  test('Test 3: Amount > ₹50,000 should require HUMAN APPROVAL / ESCALATE', () => {
    const policy = evaluatePolicy(
      {
        action: 'RETRY',
        amount: 75000, // > 50,000
        riskScore: 25,
        failureCount: 1,
        transactionId: 'TXN_TEST_003',
      },
      DEFAULT_POLICIES
    );

    expect(policy.result).toBe('REQUIRES_APPROVAL');
    expect(policy.finalAction).toBe('ESCALATE');
    expect(policy.reason).toContain('exceeds high-value threshold');
  });

  // Test 4: Risk > 70 -> BLOCK / ESCALATE
  test('Test 4: Risk score > 70 cannot be automatically recovered and must be BLOCKED / ESCALATED', () => {
    const policy = evaluatePolicy(
      {
        action: 'RETRY',
        amount: 15000,
        riskScore: 85, // > 70
        failureCount: 2,
        transactionId: 'TXN_TEST_004',
      },
      DEFAULT_POLICIES
    );

    expect(policy.result).toBe('BLOCKED');
    expect(policy.finalAction).toBe('ESCALATE');
    expect(policy.reason).toContain('exceeds threshold of 70');
  });

  // Test 5: Successful payment simulation -> Revenue recovered increases
  test('Test 5: Successful payment simulation should verify and return recovered amount', async () => {
    const amount = 2499;
    const simResult = await simulatePayment('TXN_TEST_005', amount, 'UPI', 'BANK_TIMEOUT', 'SUCCESS');
    expect(simResult.outcome).toBe('SUCCESS');

    const verification = verifyRecovery('TXN_TEST_005', amount, simResult);
    expect(verification.verified).toBe(true);
    expect(verification.recoveredAmount).toBe(amount);
  });

  // Test 6: Failed recovery -> Revenue recovered does not increase
  test('Test 6: Failed payment simulation should not increase recovered amount', async () => {
    const amount = 2499;
    const simResult = await simulatePayment('TXN_TEST_006', amount, 'CREDIT_CARD', 'CARD_DECLINED', 'DECLINED');
    expect(simResult.outcome).toBe('DECLINED');

    const verification = verifyRecovery('TXN_TEST_006', amount, simResult);
    expect(verification.verified).toBe(false);
    expect(verification.recoveredAmount).toBe(0);
  });

  // Test 7: Duplicate retry -> Idempotency protection prevents duplicate execution
  test('Test 7: Duplicate retry is prevented by Idempotency check', () => {
    const policy = evaluatePolicy(
      {
        action: 'RETRY',
        amount: 2499,
        riskScore: 18,
        failureCount: 1,
        transactionId: 'TXN_TEST_007',
        alreadyRetried: true, // Already retried
      },
      DEFAULT_POLICIES
    );

    expect(policy.result).toBe('BLOCKED');
    expect(policy.finalAction).toBe('BLOCK');
    expect(policy.reason).toContain('Idempotency check');
  });
});
