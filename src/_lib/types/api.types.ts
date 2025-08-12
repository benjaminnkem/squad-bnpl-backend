export interface ApiResponse<T = any> {
  status: number;
  success: boolean;
  message: string;
  data: T;
}

export interface PaymentInitResponse {
  merchant_info: {
    merchant_name: string;
    merchant_id: string;
  };
  currency: string;
  recurring: {
    type: number;
  };
  is_recurring: boolean;
  callback_url: string;
  transaction_ref: string;
  transaction_amount: number;
  authorized_channels: string[];
  checkout_url: string;
  allow_recurring: boolean;
  bank_list: {
    code: string;
    name: string;
    description: string;
  }[];
}
