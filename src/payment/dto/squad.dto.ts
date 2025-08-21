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
