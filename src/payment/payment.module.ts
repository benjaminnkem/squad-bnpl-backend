import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './controllers/payment.controller';
import { WebhookController } from './controllers/webhook.controller';
import { WebhookService } from './services/webhook.service';
import { SquadService } from './services/squad.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { WalletService } from 'src/wallet/wallet.service';
import { Wallet } from 'src/wallet/entities/wallet.entity';
import { Merchant } from 'src/user/entities/merchant/merchant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, Wallet, Merchant])],
  controllers: [PaymentController, WebhookController],
  providers: [PaymentService, WebhookService, SquadService, WalletService],
})
export class PaymentModule {}
