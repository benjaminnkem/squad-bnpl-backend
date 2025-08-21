import { Injectable } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { SquadService } from './services/squad.service';

@Injectable()
export class PaymentService {
  constructor(
    private readonly configService: ConfigService,
    private readonly squadService: SquadService,
  ) {}

  async createPayment(createPaymentDto: CreatePaymentDto) {}

  async updatePayment(id: string, updatePaymentDto: UpdatePaymentDto) {}

  async verifyPayment(transactionReference: string) {
    return this.squadService.verifyTransaction(transactionReference);
  }
}
