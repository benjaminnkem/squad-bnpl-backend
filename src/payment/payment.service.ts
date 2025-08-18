import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  CreatePaymentDto,
  InitiateTransactionDto,
} from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { squadApi } from 'src/_lib/config/axios';
import { ApiResponse, PaymentInitResponse } from 'src/_lib/types/api.types';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { Banks } from './data';

@Injectable()
export class PaymentService {
  constructor(private readonly configService: ConfigService) {}

  async initiateTransaction(payload: InitiateTransactionDto) {
    const {
      data: { data },
    } = await squadApi.post<ApiResponse<PaymentInitResponse>>(
      '/transaction/initiate',
      payload,
    );

    return data;
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

  async lookUpAcct(bank_code: string, account_number: string) {
    const bank = Banks.find((b) => b.bank_code === bank_code);

    if (!bank) throw new NotFoundException('Bank code is invalid');

    // const response = await this.squad.post('/payout/account/lookup', {
    //   bank_code,
    //   account_number,
    // });

    // if (response?.data?.status != 200) {
    //   throw new InternalServerErrorException(
    //     'Unable to lookup account details',
    //   );
    // }

    return {
      // account_name: response?.data?.data?.account_name,
      // account_number: response?.data?.data?.account_number,
      // bank_code: response?.data?.bank_code,
      bank_name: bank.bank_name,
    };
  }

  // async withdraw(data: {
  //   transaction_reference: string;
  //   amount: number;
  //   bank_code: string;
  //   account_number: string;
  //   account_name: string;
  // }): Promise<{ status: TransferStatus }> {
  //   data.transaction_reference = `${this.configService.get<string>('SQUAD_MERCHANT_ID')}_${data.transaction_reference}`;

  //   try {
  //     await this.squad.post('/payout/transfer', {
  //       ...data,
  //       amount: data.amount * 100,
  //       currency_id: 'NGN',
  //       remark: 'Transfer from stockly',
  //     });

  //     return { status: 'successful' };
  //   } catch (error) {
  //     if (error?.response?.status === 412) {
  //       return { status: 'reversed' };
  //     } else if (error?.response?.status === 424) {
  //       let retryCount = 0;
  //       let status: TransferStatus | undefined = undefined;

  //       while (retryCount < 2) {
  //         status = await this.requeryTransfer(data.transaction_reference);

  //         if (status != 'failed') {
  //           break;
  //         } else {
  //           retryCount += 1;
  //         }
  //       }

  //       return { status };
  //     } else {
  //       return { status: 'successful' };
  //     }
  //   }
  // }

  // async requeryTransfer(reference: string): Promise<TransferStatus> {
  //   try {
  //     const response = await this.squad.post('/payout/transfer/requery', {
  //       transaction_reference: reference,
  //     });

  //     if (response?.data?.status === 200) {
  //       return 'successful';
  //     }
  //   } catch (error: any) {
  //     if (error?.response?.status === 412) {
  //       return 'reversed';
  //     } else if (error?.response?.status === 424) {
  //       return 'failed';
  //     }
  //   }
  // }

  // async initiateUssdTransaction(body: {
  //   email: string;
  //   amount: number;
  //   currency: 'NGN';
  //   customer_name?: string;
  //   transaction_reference: string;
  // }) {
  //   const response = await this.squadInline.post('/payment/initiate', {
  //     email: body.email,
  //     amount: body.amount * 100,
  //     currency: body.currency,
  //     customer_name: body.customer_name,
  //     initiate_type: 'inline',
  //   });

  //   if (response?.data?.status != 200) {
  //     throw new InternalServerErrorException('Unable to initiate payment');
  //   }

  //   const transaction_ref = response?.data?.data?.transaction_ref;

  //   const ussdResponse = await this.squadInline.post('payment/UssdServices', {
  //     transaction_ref,
  //   });

  //   if (ussdResponse?.data?.status != 200) {
  //     throw new InternalServerErrorException('Unable to initiate payment');
  //   }

  //   const data = ussdResponse?.data?.data;

  //   const gtBankCode = data.bankList?.find(
  //     (b) => b.label === 'Guaranty Trust Bank',
  //   )?.ussd;

  //   return `${gtBankCode}${data.ussdRef}#`;
  // }

  // async generateVirtualAccountForPayment({
  //   amount,
  //   email,
  //   transaction_ref,
  // }: {
  //   amount: number;
  //   email: string;
  //   transaction_ref: string;
  // }) {
  //   const response = await this.squad.post(
  //     '/virtual-account/create-dynamic-virtual-account',
  //   );

  //   if (response?.data?.status !== 200)
  //     throw new BadRequestException('Something went wrong');

  //   const { data: initiateTransactionResponse } = await this.squad.post(
  //     '/virtual-account/initiate-dynamic-virtual-account',
  //     {
  //       amount,
  //       email,
  //       transaction_ref,
  //       duration: 60 * 60,
  //       pass_charge: true,
  //     },
  //   );

  //   if (initiateTransactionResponse?.status !== 200) {
  //     throw new BadRequestException('Something went wrong');
  //   }

  //   return {
  //     account_name: initiateTransactionResponse?.data?.account_name,
  //     account_number: initiateTransactionResponse?.data?.account_number,
  //     expected_amount: initiateTransactionResponse?.data?.expected_amount,
  //     transaction_reference:
  //       initiateTransactionResponse?.data?.transaction_reference,
  //     bank: initiateTransactionResponse?.data?.bank,
  //     currency: initiateTransactionResponse?.data?.currency,
  //     expires_at: new Date(initiateTransactionResponse?.data?.expires_at),
  //   };
  // }

  // async getVirtualAccountPaymentStatus(
  //   transaction_reference: string,
  // ): Promise<{ status: 'pending' | 'expired' | 'successful' }> {
  //   const response = await this.squad.get(
  //     `/virtual-account/get-dynamic-virtual-account-transactions/${transaction_reference}`,
  //   );

  //   if (response?.data?.status !== 200)
  //     throw new BadRequestException('Something went wrong');

  //   const attempts = response?.data?.data?.rows;

  //   if (!response?.data?.data?.count) {
  //     return { status: 'pending' };
  //   }

  //   const is_expired = attempts.find((a) => a.transaction_status === 'EXPIRED');

  //   if (is_expired) {
  //     return { status: 'expired' };
  //   }

  //   const is_successful = attempts.find(
  //     (a) => a.transaction_status === 'SUCCESS',
  //   );

  //   if (is_successful) {
  //     return { status: 'successful' };
  //   }

  //   return { status: 'pending' };
  // }
}
