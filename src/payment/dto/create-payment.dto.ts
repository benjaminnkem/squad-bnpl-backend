import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreatePaymentDto {}

export class InitiateTransactionDto {
  @IsNumber()
  amount: number;

  @IsEmail()
  email: string;

  @IsEnum(['NGN', 'USD'])
  currency: string;

  @IsEnum(['inline'])
  initiate_type: string;

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
}
