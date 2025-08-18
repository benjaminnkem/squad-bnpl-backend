import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './controllers/payment.controller';
import { WebhookController } from './controllers/webhook.controller';
import { WebhookService } from './services/webhook.service';

@Module({
  controllers: [PaymentController, WebhookController],
  providers: [PaymentService, WebhookService],
})
export class PaymentModule {}
