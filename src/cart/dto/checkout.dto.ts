import {
  IsEnum,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsString,
  IsUUID,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum CheckoutType {
  FULL_PAYMENT = 'full_payment',
  BNPL = 'bnpl',
}

export class CheckoutDto {
  @ApiProperty({
    description: 'Type of checkout - full payment or BNPL',
    enum: CheckoutType,
    example: CheckoutType.BNPL,
  })
  @IsEnum(CheckoutType)
  checkoutType: CheckoutType;

  @ApiProperty({
    description: 'Number of installments (required for BNPL)',
    example: 3,
    minimum: 2,
    maximum: 12,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(2)
  @Max(12)
  installments?: number;

  @ApiProperty({
    description: 'Shipping address',
    example: '123 Lagos Street, Victoria Island',
  })
  @IsString()
  shippingAddress: string;

  @ApiProperty({
    description: 'Shipping city',
    example: 'Lagos',
  })
  @IsString()
  shippingCity: string;

  @ApiProperty({
    description: 'Shipping state',
    example: 'Lagos',
  })
  @IsString()
  shippingState: string;

  @ApiProperty({
    description: 'Shipping phone number',
    example: '+2348123456789',
    required: false,
  })
  @IsOptional()
  @IsString()
  shippingPhone?: string;

  @ApiProperty({
    description: 'Order notes',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CheckoutResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  message: string;

  @ApiProperty()
  orderId: string;

  @ApiProperty()
  orderNumber: string;

  @ApiProperty()
  checkoutType: CheckoutType;

  @ApiProperty()
  totalAmount: number;

  @ApiProperty()
  amountToPay: number;

  @ApiProperty()
  paymentUrl?: string;

  @ApiProperty()
  installmentPlan?: {
    totalInstallments: number;
    installmentAmount: number;
    firstPaymentAmount: number;
    nextDueDate: string;
  };
}
