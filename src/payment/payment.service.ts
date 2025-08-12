import { Injectable } from '@nestjs/common';
import {
  CreatePaymentDto,
  InitiateTransactionDto,
} from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { squadApi } from 'src/_lib/config/axios';
import { ApiResponse, PaymentInitResponse } from 'src/_lib/types/api.types';

@Injectable()
export class PaymentService {
  async initiateTransaction(payload: InitiateTransactionDto) {
    const {
      data: { data },
    } = await squadApi.post<ApiResponse<PaymentInitResponse>>(
      '/transaction/initiate',
      payload,
    );

    return data;
  }

  create(createPaymentDto: CreatePaymentDto) {
    return 'This action adds a new payment';
  }

  findAll() {
    return `This action returns all payment`;
  }

  findOne(id: string) {
    return `This action returns a #${id} payment`;
  }

  update(id: string, updatePaymentDto: UpdatePaymentDto) {
    return `This action updates a #${id} payment`;
  }

  remove(id: string) {
    return `This action removes a #${id} payment`;
  }
}
