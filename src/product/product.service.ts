import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { FindManyOptions, Repository } from 'typeorm';
import { MerchantService } from 'src/user/services/merchant/merchant.service';
import { QueryProductDto } from './dto/product-filters.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    private readonly merchantService: MerchantService,
  ) {}

  async create(userId: string, createProductDto: CreateProductDto) {
    try {
      const merchant = await this.merchantService.getMerchantProfile(userId);
      if (!merchant) throw new BadRequestException('User not found');

      const product = this.productRepository.create({
        ...createProductDto,
        price: Number(createProductDto.price),
        merchant,
      });

      return this.productRepository.save(product);
    } catch (error) {
      // TODO: Remove Images
      throw new BadRequestException('Error creating product');
    }
  }

  async findAll(query: QueryProductDto) {
    const { limit = 20, page = 1 } = query;
    const skip = (page - 1) * limit;

    const options: FindManyOptions<Product> = {};
    options.take = limit;
    options.skip = skip;
    options.order = { createdAt: 'DESC' };

    const total = await this.productRepository.count();
    const hasNext = total > skip + limit;

    const pagination = {
      total,
      page,
      limit,
      hasNext,
    };

    return {
      data: await this.productRepository.find(options),
      pagination,
    };
  }

  async findOne(id: string) {
    return await this.productRepository.findOne({
      where: { id },
      relations: ['merchant'],
    });
  }

  async update(userId: string, id: string, updateProductDto: UpdateProductDto) {
    const merchant = await this.merchantService.getMerchantProfile(userId);
    if (!merchant) throw new BadRequestException('User not found');

    await this.productRepository.update(id, updateProductDto);
  }

  async remove(userId: string, id: string) {
    return await this.productRepository.delete(id);
  }
}
