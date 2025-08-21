import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { Currency, InitiateType } from '../enums';

export class InitiateTransactionDto {
  @IsNumber()
  amount: number;

  @IsEmail()
  email: string;

  @IsEnum(Currency)
  currency: Currency;

  @IsEnum([InitiateType])
  initiate_type: InitiateType;

  @IsString()
  @IsOptional()
  customer_name: string;

  @IsString()
  @IsOptional()
  transaction_ref: string;

  @IsString()
  @IsOptional()
  callback_url: string;

  @IsBoolean()
  @IsOptional()
  pass_charge: boolean;

  @IsObject()
  @IsOptional()
  metadata: Record<string, any>;
}

export interface SquadTransactionResponse {
  success: boolean;
  data: {
    checkout_url: string;
    transaction_ref: string;
  };
  message: string;
}

export class VerifyTransaction {
  @IsNumber()
  transaction_amount: number;

  @IsString()
  transaction_ref: string;

  @IsString()
  email: string;

  @IsString()
  transaction_status: string;

  @IsString()
  transaction_currency_id: string;

  @IsString()
  created_at: string;

  @IsString()
  transaction_type: string;

  @IsString()
  merchant_name: string;

  @IsString()
  merchant_business_name: string | null;

  @IsString()
  gateway_transaction_ref: string;

  @IsString()
  recurring: string | null;

  @IsString()
  merchant_email: string;

  @IsString()
  plan_code: string | null;
}
