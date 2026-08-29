import { config } from '../config/env';
import { FailureReason, RecoveryAction } from '../types';

export interface AIContext {
  transactionId: string;
  failureReason: FailureReason;
  amount: number;
  riskScore: number;
  recoveryProbability: number;
  customerHistory: string;
  previousFailures: number;
  recommendedAction: RecoveryAction;
}

export interface AIResult {
  explanation: string;
  aiUsed: boolean;
  model: string;
}

const FAILURE_EXPLANATIONS: Record<FailureReason, string> = {
  BANK_TIMEOUT: 'Temporary bank connectivity issue — high recovery likelihood with immediate retry.',
  INSUFFICIENT_FUNDS: 'Customer account had insufficient balance at payment time — payment reminder recommended.',
  CARD_DECLINED: 'Card issuer declined the transaction — review customer profile and retry or change method.',
  NETWORK_ERROR: 'Network disruption caused the failure — immediate retry is likely to succeed.',
  AUTHENTICATION_FAILURE: 'Authentication step failed — retry should prompt re-authentication successfully.',
  EXPIRED_CARD: 'Card on file is expired — customer must update their payment method.',
  LIMIT_EXCEEDED: 'Transaction exceeded card or account limits — payment reminder or method change advised.',
  UNKNOWN_ERROR: 'Unclassified error from payment gateway — conservative action recommended.',
};

function deterministicExplanation(ctx: AIContext): string {
  const base = FAILURE_EXPLANATIONS[ctx.failureReason];
  return (
    `${base} Risk score: ${ctx.riskScore}/100 (${ctx.riskScore <= 30 ? 'LOW' : ctx.riskScore <= 70 ? 'MEDIUM' : 'HIGH'}). ` +
    `Recovery probability: ${ctx.recoveryProbability}%. ` +
    `Customer history is ${ctx.customerHistory.toLowerCase()}. ` +
    `Recommended action: ${ctx.recommendedAction.replace(/_/g, ' ')}.`
  );
}

export async function generateDecisionExplanation(ctx: AIContext): Promise<AIResult> {
  if (!config.aiApiKey) {
    return {
      explanation: deterministicExplanation(ctx),
      aiUsed: false,
      model: 'deterministic-fallback',
    };
  }

  try {
    const prompt =
      `You are RecoverAI, an autonomous payment recovery agent. ` +
      `Provide a concise business explanation (2-3 sentences) for this recovery decision. ` +
      `Do not expose internal chain-of-thought. Be professional and data-driven. ` +
      `Transaction context: ${JSON.stringify(ctx)}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${config.aiModel}:generateContent?key=${config.aiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    const data = await response.json() as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Empty AI response received');

    return { explanation: text.trim(), aiUsed: true, model: config.aiModel };
  } catch (err) {
    console.error('[AIService] Gemini API failed, using deterministic fallback:', (err as Error).message);
    return {
      explanation: deterministicExplanation(ctx),
      aiUsed: false,
      model: 'deterministic-fallback',
    };
  }
}
