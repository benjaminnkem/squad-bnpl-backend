export interface VerifyTransaction {
  transaction_amount: number;
  transaction_ref: string;
  email: string;
  transaction_status: string;
  transaction_currency_id: string;
  created_at: string;
  transaction_type: string;
  merchant_name: string;
  merchant_business_name: string | null;
  gateway_transaction_ref: string;
  recurring: string | null;
  merchant_email: string;
  plan_code: string | null;
}
