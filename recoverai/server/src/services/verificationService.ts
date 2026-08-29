import { SimulationResult } from './paymentSimulator';

export interface VerificationResult {
  verified: boolean;
  recoveredAmount: number;
  verificationRef: string;
  verifiedAt: Date;
  reason: string;
}

export function verifyRecovery(
  transactionId: string,
  amount: number,
  simResult: SimulationResult
): VerificationResult {
  const verified = simResult.outcome === 'SUCCESS';
  return {
    verified,
    recoveredAmount: verified ? amount : 0,
    verificationRef: `VER_${transactionId}_${Date.now()}`,
    verifiedAt: new Date(),
    reason: verified
      ? `Payment verified. Simulation ref: ${simResult.transactionRef}. Latency: ${simResult.latencyMs}ms.`
      : `Verification failed. Simulation outcome: ${simResult.outcome}. ${simResult.reason}`,
  };
}
