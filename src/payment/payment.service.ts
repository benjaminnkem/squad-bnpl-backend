import { Injectable } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

@Injectable()
export class PaymentService {
  constructor(private readonly configService: ConfigService) {}

  async createPayment(createPaymentDto: CreatePaymentDto) {}

  async updatePayment(id: string, updatePaymentDto: UpdatePaymentDto) {}
}
