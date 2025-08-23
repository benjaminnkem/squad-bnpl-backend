import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';
import { DataSource, QueryRunner } from 'typeorm';
import { User } from 'src/user/entities/user/user.entity';
import { Merchant } from 'src/user/entities/merchant/merchant.entity';
import { Wallet } from './entities/wallet.entity';

@Injectable()
export class WalletService {
  private readonly logger: Logger = new Logger(WalletService.name);

  constructor(private readonly dataSource: DataSource) {}

  async getOrCreate(userId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await queryRunner.manager.findOne(User, {
        where: { id: userId },
        relations: ['merchant'],
        select: {
          merchant: { id: true },
        },
      });

      if (!user) throw new UnauthorizedException('User not found');

      if (!user.merchant)
        throw new UnauthorizedException('Please apply as a merchant first');

      const wallet = await queryRunner.manager.findOneBy(Wallet, {
        merchantId: user.merchant.id,
      });

      if (wallet) {
        await queryRunner.commitTransaction();
        return wallet;
      }

      const newWallet = queryRunner.manager.create(Wallet, {
        merchantId: user.merchant.id,
      });
      await queryRunner.commitTransaction();
      return newWallet;
    } catch {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  async addPayout(
    merchantId: string,
    amount: number,
    queryRunner: QueryRunner,
  ) {
    const wallet = await this.getOrCreate(merchantId);
    if (!wallet) throw new UnauthorizedException('Wallet not found');

    wallet.balance += amount;
    await queryRunner.manager.save(wallet);
    return wallet;
  }
}
