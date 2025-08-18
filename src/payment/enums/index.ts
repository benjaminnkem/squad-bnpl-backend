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

export enum ExpensesType {
  PERIODIC = 'PERIODIC',
  ONE_OFF = 'ONE_OFF',
  RECORD = 'RECORD',
}

export enum ExpenseFrequency {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  BI_WEEKLY = 'BI_WEEKLY',
  MONTHLY = 'MOTHLY',
  BI_MONTHLY = 'BI_MONTHLY',
  QUATERLY = 'QUATERLY',
  YEARLY = 'YEARLY',
}

export enum ExpenseStatus {
  ACTIVE = 'ACTIVE',
  DELETED = 'DELETED',
  PAID = 'PAID',
  PAYOUT_FAILED = 'PAYOUT_FAILED',
}

export type TransferStatus = 'failed' | 'reversed' | 'successful';
