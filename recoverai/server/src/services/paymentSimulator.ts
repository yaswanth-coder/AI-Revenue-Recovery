import { PaymentMethod, SimulationOutcome } from '../types';

export interface SimulationResult {
  outcome: SimulationOutcome;
  transactionRef: string;
  latencyMs: number;
  reason: string;
  simulatedAt: Date;
}

// Realistic success rates per original failure reason on retry
const RETRY_SUCCESS_RATES: Record<string, number> = {
  BANK_TIMEOUT: 0.85,
  NETWORK_ERROR: 0.82,
  AUTHENTICATION_FAILURE: 0.75,
  CARD_DECLINED: 0.55,
  INSUFFICIENT_FUNDS: 0.20,
  LIMIT_EXCEEDED: 0.30,
  EXPIRED_CARD: 0.05,
  UNKNOWN_ERROR: 0.50,
};

/**
 * Simulates a payment gateway. No real money, no real card data.
 * All outcomes are synthetic and probabilistic.
 */
export async function simulatePayment(
  transactionId: string,
  _amount: number,
  _paymentMethod: PaymentMethod,
  originalFailureReason: string,
  forceOutcome?: SimulationOutcome
): Promise<SimulationResult> {
  const latencyMs = 500 + Math.floor(Math.random() * 1500);
  // Simulate realistic latency (capped for API responsiveness)
  await new Promise((r) => setTimeout(r, Math.min(latencyMs, 250)));

  if (forceOutcome) {
    return {
      outcome: forceOutcome,
      transactionRef: `SIM_${transactionId}_${Date.now()}`,
      latencyMs,
      reason: `Simulation forced outcome: ${forceOutcome}`,
      simulatedAt: new Date(),
    };
  }

  const successRate = RETRY_SUCCESS_RATES[originalFailureReason] ?? 0.5;
  const rand = Math.random();

  let outcome: SimulationOutcome;
  let reason: string;

  if (rand < successRate) {
    outcome = 'SUCCESS';
    reason = 'Payment processed successfully by simulated payment gateway.';
  } else if (rand < successRate + 0.08) {
    outcome = 'TIMEOUT';
    reason = 'Simulated gateway timeout on retry attempt.';
  } else if (rand < successRate + 0.15) {
    outcome = 'DECLINED';
    reason = 'Simulated card declined by issuing bank on retry.';
  } else {
    outcome = 'FAILED';
    reason = 'Simulated payment gateway returned a processing error.';
  }

  return {
    outcome,
    transactionRef: `SIM_${transactionId}_${Date.now()}`,
    latencyMs,
    reason,
    simulatedAt: new Date(),
  };
}
