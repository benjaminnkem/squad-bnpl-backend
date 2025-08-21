import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PaymentService } from '../payment.service';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { UpdatePaymentDto } from '../dto/update-payment.dto';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get('verify/:transactionReference')
  async verifyPayment(
    @Param('transactionReference') transactionReference: string,
  ) {
    return this.paymentService.verifyPayment(transactionReference);
  }
}
