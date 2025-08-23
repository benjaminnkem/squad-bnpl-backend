import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wallet } from './entities/wallet.entity';
import { Merchant } from 'src/user/entities/merchant/merchant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Wallet, Merchant])],
  controllers: [WalletController],
  providers: [WalletService],
})
export class WalletModule {}
