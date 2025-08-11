import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Cart } from './entities/cart.entity';
import { Repository } from 'typeorm';
import { Product } from 'src/product/entities/product.entity';
import { User } from 'src/user/entities/user/user.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
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
}
