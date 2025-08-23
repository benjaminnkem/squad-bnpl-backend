import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { DataSource, QueryRunner } from 'typeorm';
import { Wallet } from './entities/wallet.entity';

@Injectable()
export class WalletService {
  private readonly logger: Logger = new Logger(WalletService.name);

  constructor(private readonly dataSource: DataSource) {}

  async getOrCreate(merchantId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const wallet = await queryRunner.manager.findOneBy(Wallet, {
        merchantId: merchantId,
      });

      if (wallet) {
        await queryRunner.commitTransaction();
        return wallet;
      }

      const newWallet = queryRunner.manager.create(Wallet, {
        merchantId,
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
