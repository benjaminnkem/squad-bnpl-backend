import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Cart } from './entities/cart.entity';
import { Repository } from 'typeorm';
import { Product } from 'src/product/entities/product.entity';
import { User } from 'src/user/entities/user/user.entity';
import { ConfigService } from '@nestjs/config';
import { squadApi } from 'src/_lib/config/axios';
import { nanoid } from 'nanoid';
import { ApiResponse, PaymentInitResponse } from 'src/_lib/types/api.types';
import { PaymentService } from 'src/payment/payment.service';

@Injectable()
export class CartService {
  private readonly logger = new Logger(CartService.name);

  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly configService: ConfigService,

    private readonly paymentService: PaymentService,
  ) {}

  async create(userId: string, createCartDto: CreateCartDto) {
    const product = await this.productRepository.findOneBy({
      id: createCartDto.productId,
    });
    if (!product) throw new BadRequestException('Product not found');

    const existingCartItem = await this.cartRepository.findOne({
      where: { productId: createCartDto.productId, userId: userId },
    });

    if (existingCartItem)
      throw new BadRequestException('Product already in cart');

    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) throw new BadRequestException('User not found');

    const cart = this.cartRepository.create({
      ...createCartDto,
      user,
    });
    return this.cartRepository.save(cart);
  }

  async findAll(userId: string) {
    return this.cartRepository.find({ where: { userId } });
  }

  async findOne(userId: string, id: string) {
    return this.cartRepository.findOne({ where: { id, userId } });
  }

  async update(userId: string, id: string, updateCartDto: UpdateCartDto) {
    return this.cartRepository.update({ id, userId }, updateCartDto);
  }

  async remove(userId: string, id: string) {
    return this.cartRepository.delete({ id, userId });
  }

  async checkout(userId: string) {
    try {
      const user = await this.userRepository.findOneBy({ id: userId });
      if (!user) throw new BadRequestException('User not found');

      // const cartItems = await this.findAll(userId);

      const amount = 20000;

      const payload = {
        amount: amount * 100,
        email: user.email,
        currency: 'NGN',
        initiate_type: 'inline',
        customer_name: user.fullName,
        transaction_ref: `txn_${nanoid(10)}`,
        callback_url:
          this.configService.get<string>('FRONTEND_URL') +
          '/cart?state=success',
        pass_charge: true,
      };

      const data = await this.paymentService.initiateTransaction(payload);

      return data;
    } catch (error) {
      this.logger.error(
        'Checkout failed',
        error?.response?.data || error.message,
      );
      throw new BadRequestException('Checkout failed');
    }
  }
}
