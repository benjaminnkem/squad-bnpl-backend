import { IsEnum } from 'class-validator';
import { PayoutPlan } from 'src/payment/enums';

export class CheckoutDto {
  @IsEnum(PayoutPlan)
  paymentPlan: PayoutPlan;
}
