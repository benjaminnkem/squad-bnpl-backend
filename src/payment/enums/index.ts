export enum PaymentDirection {
  INFLOW = 'INFLOW',
  OUTFLOW = 'OUTFLOW',
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

export enum PaymentStatus {
  PENDING = 'pending',
  SUCCESSFUL = 'successful',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export enum PaymentMethod {
  CARD = 'card',
  BANK_TRANSFER = 'bank_transfer',
  USSD = 'ussd',
  BANK_TRANSFER_AUTO = 'bank_transfer_auto',
  WALLET = 'wallet',
}

export enum PaymentPurpose {
  ORDER_PAYMENT = 'order_payment',
  INSTALLMENT_PAYMENT = 'installment_payment',
  LATE_FEE_PAYMENT = 'late_fee_payment',
}

export enum Currency {
  NGN = 'NGN',
  USD = 'USD',
  EUR = 'EUR',
}

export enum InitiateType {
  INLINE = 'inline',
  REDIRECT = 'redirect',
}
