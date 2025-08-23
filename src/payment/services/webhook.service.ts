import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Request } from 'express';
import { PaymentStatus, WebhookEvent } from '../enums';
import { SquadService } from './squad.service';
import { DataSource } from 'typeorm';
import { Payment } from '../entities/payment.entity';
import { Order } from 'src/order/entities/order.entity';
import { OrderStatus } from 'src/order/enums';

@Injectable()
export class WebhookService {
  private logger: Logger = new Logger(WebhookService.name);

  constructor(
    private squadProvider: SquadService,
    private readonly dataSource: DataSource,
  ) {}

  async processSquadWebhook(req: Request) {
    this.squadProvider.verifyWebhookSignal(
      <string>req.headers['x-squad-encrypted-body'],
      req.body,
    );

    const { Event, Body } = req.body;

    console.log({ Event, Body });

    if (Event === WebhookEvent.CHARGE_SUCCESSFUL) {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        const payment = await queryRunner.manager.findOne(Payment, {
          where: { orderId: Body?.meta?.order_id },
        });

        if (!payment) {
          this.logger.error('Payment not found');
          throw new NotFoundException('Payment not found');
        }

        payment.status = PaymentStatus.SUCCESSFUL;
        payment.paidAt = new Date();
        payment.paymentMethod =
          Body?.payment_information.payment_type || 'card';

        await queryRunner.manager.save(payment);

        const order = await queryRunner.manager.findOne(Order, {
          where: { id: Body?.meta?.order_id },
        });

        if (!order) {
          this.logger.error('Order not found');
          throw new NotFoundException('Order not found');
        }

        order.status = OrderStatus.PROCESSING;
        await queryRunner.manager.save(order);

        await queryRunner.commitTransaction();

        // await this.walletModel.updateOne(
        //   { store: transaction.store._id },
        //   {
        //     $inc: { balance: transaction.amount },
        //   },
        //   { session },
        // );

        return 'Payment Webhook ran successfully';
      } catch (error) {
        await queryRunner.rollbackTransaction();
        this.logger.error(`Error processing webhook:`, error);
        throw error;
      } finally {
        await queryRunner.release();
      }
    }
  }
}
