export enum PaymentDirection {
  INFLOW = 'INFLOW',
  OUTFLOW = 'OUTFLOW',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCESSFUL = 'SUCCESSFUL',
  FAILED = 'FAILED',
  REVOKED = 'REVOKED',
}

export enum PaymentPurpose {
  PAYOUT = 'PAYOUT',
  ORDER = 'ORDER',
  WITHDRAWAL = 'WITHDRAWAL',
}

export enum WebhookEvent {
  CHARGE_SUCCESSFUL = 'charge_successful',
}

export type TransferStatus = 'failed' | 'reversed' | 'successful';

export enum SquadPaymentMethod {
  CARD = 'card',
  BANK_TRANSFER = 'bank_transfer',
  WALLET = 'wallet',
}

export enum PayoutPlan {
  IN_FULL = 'IN_FULL',
  IN_4 = 'IN_4',
  IN_3 = 'IN_3',
  PAY_LATER = 'IN_LATER',
}
