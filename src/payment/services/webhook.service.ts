import { Injectable, NotFoundException } from '@nestjs/common';
import { Request } from 'express';
import { PaymentStatus, WebhookEvent } from '../enums';
import { PaymentService } from '../payment.service';

@Injectable()
export class WebhookService {
  constructor(private squadProvider: PaymentService) {}

  async processSquadWebhook(req: Request) {
    this.squadProvider.verifyWebhookSignal(
      <string>req.headers['x-squad-encrypted-body'],
      req.body,
    );

    const { Event, Body } = req.body;

    console.log({ Event, Body });

    if (Event === WebhookEvent.CHARGE_SUCCESSFUL) {
      console.log('Charge successful webhook received');
      // const session = await this.transactionModel.startSession();

      // session.startTransaction();

      try {
        // const transaction = await this.transactionModel
        //   .findOne({
        //     transaction_reference: Body.transaction_ref,
        //   })
        //   .populate({ path: 'store', populate: 'owner' });

        // if (!transaction) throw new NotFoundException('Transaction not found');

        // transaction.status = PaymentStatus.SUCCESSFUL;
        // await transaction.save({ session });

        // await this.walletModel.updateOne(
        //   { store: transaction.store._id },
        //   {
        //     $inc: { balance: transaction.amount },
        //   },
        //   { session },
        // );

        // await session.commitTransaction();

        return {
          msg: 'Webhook ran successfully',
        };
      } catch (error) {
        throw error;
      }
    }
  }
}
