import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Request } from 'express';
import { PaymentPurpose, PaymentStatus, WebhookEvent } from '../enums';
import { SquadService } from './squad.service';
import { DataSource, QueryRunner } from 'typeorm';
import { Payment } from '../entities/payment.entity';
import { Order } from 'src/order/entities/order.entity';
import { OrderStatus } from 'src/order/enums';
import { MailerService } from '@nestjs-modules/mailer';
import { Wallet } from 'src/wallet/entities/wallet.entity';
import { formatNaira } from 'src/_lib/helpers/numbers';
import { format } from 'date-fns';
import { OrderItem } from 'src/order/entities/order-item.entity';
import { WalletService } from 'src/wallet/wallet.service';

@Injectable()
export class WebhookService {
  private logger: Logger = new Logger(WebhookService.name);

  constructor(
    private squadProvider: SquadService,
    private readonly dataSource: DataSource,
    private readonly mailerService: MailerService,
    private readonly walletService: WalletService,
  ) {}

  async processSquadWebhook(req: Request) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      this.squadProvider.verifyWebhookSignal(
        <string>req.headers['x-squad-encrypted-body'],
        req.body,
      );

      const { Event, Body } = req.body;

      const { gateway_ref, meta, transaction_status } = Body;

      const paymentStatus =
        transaction_status === 'success'
          ? PaymentStatus.SUCCESSFUL
          : PaymentStatus.FAILED;

      const payment = await queryRunner.manager.findOne(Payment, {
        where: { orderId: meta?.order_id },
      });

      if (!payment) {
        this.logger.error('Payment not found');
        throw new NotFoundException('Payment not found');
      }

      payment.status = paymentStatus;
      payment.paidAt = new Date();
      payment.paymentMethod = Body?.payment_information.payment_type || 'card';
      payment.gatewayReference = gateway_ref;
      payment.gatewayResponse = JSON.stringify(Body);

      await queryRunner.manager.save(payment);

      if (Event === WebhookEvent.CHARGE_SUCCESSFUL) {
        await this.handleSuccessfulPayment(queryRunner, payment);
        this.logger.log('Payment successful webhook processed');
      } else {
        this.handleFailedPayment(queryRunner, payment);
        this.logger.log('Payment failed webhook processed');
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Error processing webhook:`, error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async handleSuccessfulPayment(queryRunner: QueryRunner, payment: Payment) {
    const order = await queryRunner.manager.findOne(Order, {
      where: { id: payment.orderId, status: OrderStatus.PENDING },
      relations: ['user'],
      select: { user: { email: true, firstName: true } },
    });

    console.log({
      orderId: order?.id,
      paymentId: payment.id,
      paymentOrderId: payment.orderId,
    });

    if (!order) {
      this.logger.error('Order not found');
      throw new NotFoundException('Order not found');
    }

    if (payment.purpose === PaymentPurpose.ORDER_PAYMENT) {
      order.status = OrderStatus.CONFIRMED;
      // await this.walletService.addPayout(
      //   order.merchantId,
      //   Number(payment.amount),
      //   queryRunner,
      // );
    } else if (payment.purpose === PaymentPurpose.INSTALLMENT_PAYMENT) {
    }

    await queryRunner.manager.save(order);

    // await queryRunner.manager.increment(
    //   Wallet,
    //   order?.merchantId,
    //   'balance',
    //   payment.amount,
    // );

    const orderItems = await queryRunner.manager.find(OrderItem, {
      where: { orderId: order.id },
      relations: ['product'],
      select: { product: { name: true } },
    });

    await this.mailerService
      .sendMail({
        to: order.user.email,
        subject: 'Payment Confirmed',
        template: 'payment-success',
        context: {
          firstName: order.user.firstName,
          email: order.user.email,
          amount: formatNaira(payment.amount),
          paymentMethod: payment.paymentMethod,
          orderNumber: order.orderNumber,
          paymentDate: format(new Date(`${payment.paidAt}`), 'MMMM dd, yyyy'),
          paymentRef: payment.reference,
          items: orderItems.map((item) => ({
            name: item.product.name,
            quantity: item.quantity,
          })),
        },
      })
      .catch((error) => {
        this.logger.error(
          `Failed to send payment success email: ${error.message}`,
        );

        // I might need to send logs to admin
      });
  }

  async handleFailedPayment(queryRunner: QueryRunner, payment: Payment) {
    const order = await queryRunner.manager.findOne(Order, {
      where: { id: payment.orderId, status: OrderStatus.PENDING },
      relations: ['user'],
      select: { user: { email: true, firstName: true } },
    });

    if (!order) {
      this.logger.error('Order not found');
      throw new NotFoundException('Order not found');
    }

    const orderItems = await queryRunner.manager.find(OrderItem, {
      where: { orderId: order.id },
      relations: ['product'],
      select: { product: { name: true } },
    });

    await this.mailerService.sendMail({
      to: order.user.email,
      subject: 'Payment Failed',
      template: 'payment-failed',
      context: {
        firstName: order.user.firstName,
        orderNumber: order.orderNumber,
        attemptDate: format(new Date(`${payment.paidAt}`), 'MMMM dd, yyyy'),
        email: order.user.email,
        amount: formatNaira(payment.amount),
        paymentMethod: payment.paymentMethod,
        paymentDate: format(new Date(`${payment.paidAt}`), 'MMMM dd, yyyy'),
        paymentRef: payment.reference,
        items: orderItems.map((item) => ({
          name: item.product.name,
          quantity: item.quantity,
          price: formatNaira(item.unitPrice),
        })),
      },
    });
  }
}
