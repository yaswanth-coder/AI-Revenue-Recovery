export type FailureReason =
  | 'BANK_TIMEOUT'
  | 'INSUFFICIENT_FUNDS'
  | 'CARD_DECLINED'
  | 'NETWORK_ERROR'
  | 'AUTHENTICATION_FAILURE'
  | 'EXPIRED_CARD'
  | 'LIMIT_EXCEEDED'
  | 'UNKNOWN_ERROR';

export type PaymentMethod = 'CREDIT_CARD' | 'DEBIT_CARD' | 'NET_BANKING' | 'UPI' | 'WALLET';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export type RecoveryAction =
  | 'RETRY'
  | 'SEND_REMINDER'
  | 'CHANGE_PAYMENT_METHOD'
  | 'ESCALATE'
  | 'BLOCK'
  | 'NO_ACTION';

export type TransactionStatus = 'FAILED' | 'RECOVERED' | 'PENDING' | 'BLOCKED' | 'ESCALATED';

export type RecoveryStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'RECOVERED'
  | 'FAILED'
  | 'ESCALATED'
  | 'BLOCKED';

export type PolicyResult = 'ALLOWED' | 'BLOCKED' | 'REQUIRES_APPROVAL';

export type CustomerHistory = 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'NEW';

export type SimulationOutcome = 'SUCCESS' | 'FAILED' | 'TIMEOUT' | 'DECLINED';
