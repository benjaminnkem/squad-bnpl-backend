import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { PaymentDirection, PaymentPurpose, SquadPaymentMethod } from '../enums';

export class CreatePaymentDto {
  @IsNumber()
  amount: number;

  @IsEnum(SquadPaymentMethod)
  method: SquadPaymentMethod;

  @IsEnum(PaymentDirection)
  direction: PaymentDirection;

  @IsEnum(PaymentPurpose)
  purpose: PaymentPurpose;
}
