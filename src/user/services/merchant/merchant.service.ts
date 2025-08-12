import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateMerchantDto } from 'src/user/dto/merchant/create-merchant.dto';
import { UpdateMerchantDto } from 'src/user/dto/merchant/update-merchant.dto';
import { Merchant } from 'src/user/entities/merchant/merchant.entity';
import { User } from 'src/user/entities/user/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MerchantService {
  constructor(
    @InjectRepository(Merchant)
    private readonly merchantRepository: Repository<Merchant>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async validateMerchantBusinessName(businessName: string) {
    if (!businessName || businessName.trim() === '')
      throw new BadRequestException('Business name is required');

    const existingMerchant = await this.merchantRepository.findOneBy({
      businessName,
    });
    return !existingMerchant;
  }

  async becomeAMerchant(userId: string, data: CreateMerchantDto) {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) throw new BadRequestException('User not found');

    const isBusinessNameValid = await this.validateMerchantBusinessName(
      data.businessName,
    );
    if (!isBusinessNameValid)
      throw new BadRequestException('Business name already exists');

    const merchant = this.merchantRepository.create({
      ...data,
      user,
    });

    return this.merchantRepository.save(merchant);
  }

  async getMerchantProfile(userId: string) {
    const merchant = await this.merchantRepository.findOne({
      where: { user: { id: userId } },
    });
    if (!merchant) throw new BadRequestException('Merchant not found');
    return merchant;
  }

  async getMerchantById(merchantId: string) {
    const merchant = await this.merchantRepository.findOne({
      where: { id: merchantId },
    });
    if (!merchant) throw new BadRequestException('Merchant not found');
    return merchant;
  }

  async updateProfile(userId: string, updateProfileDto: UpdateMerchantDto) {
    const merchant = await this.getMerchantProfile(userId);
    if (!merchant) throw new BadRequestException('Merchant profile not found');

    Object.assign(merchant, updateProfileDto);
    return this.merchantRepository.save(merchant);
  }
}
