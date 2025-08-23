import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { QueryRunner, Repository } from 'typeorm';
import { Wallet } from './entities/wallet.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Merchant } from 'src/user/entities/merchant/merchant.entity';

@Injectable()
export class WalletService {
  private readonly logger: Logger = new Logger(WalletService.name);

  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
    @InjectRepository(Merchant)
    private readonly merchantRepository: Repository<Merchant>,
  ) {}

  async getOrCreate(merchantId: string) {
    try {
      const wallet = await this.walletRepository.findOneBy({
        merchantId: merchantId,
      });

      if (wallet) return wallet;

      const merchant = await this.merchantRepository.findOneBy({
        id: merchantId,
      });

      if (!merchant) throw new BadRequestException('Merchant not found');

      const newWallet = this.walletRepository.create({
        merchantId,
        merchant,
      });

      await this.walletRepository.save(newWallet);

      return newWallet;
    } catch (error) {
      this.logger.error('Error creating wallet');
      throw new BadRequestException(error.message || 'Error creating wallet');
    }
  }

  async addPayout(
    merchantId: string,
    amount: number,
    queryRunner: QueryRunner,
  ) {
    const wallet = await this.getOrCreate(merchantId);
    if (!wallet) throw new UnauthorizedException('Wallet not found');

    wallet.balance = Number(wallet.balance) + Number(amount);
    await queryRunner.manager.save(wallet);
    return wallet;
  }
}
