import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { squadApi } from 'src/_lib/config/axios';
import { ApiResponse, PaymentInitResponse } from 'src/_lib/types/api.types';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { InitiateTransactionDto } from '../dto/squad.dto';

@Injectable()
export class SquadService {
  constructor(private readonly configService: ConfigService) {}

  async initiateTransaction(payload: InitiateTransactionDto) {
    try {
      const {
        data: { data },
      } = await squadApi.post<ApiResponse<PaymentInitResponse>>(
        '/transaction/initiate',
        payload,
      );

      return data;
    } catch (error) {
      console.error('Error initiating transaction:', error.message);
      throw error;
    }
  }

  verifyWebhookSignal(encryptedBody: string, body: any) {
    const hash = crypto
      // @ts-ignore
      .createHmac('sha512', this.configService.get<string>('SQUAD_SECRET_KEY'))
      .update(JSON.stringify(body))
      .digest('hex')
      .toUpperCase();

    if (hash != encryptedBody) {
      throw new UnauthorizedException('Webhook not from squad');
    }

    return true;
  }
}
