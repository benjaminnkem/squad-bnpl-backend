import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { Product } from './entities/product.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MerchantService } from 'src/user/services/merchant/merchant.service';
import { Merchant } from 'src/user/entities/merchant/merchant.entity';
import { UserService } from 'src/user/services/user/user.service';
import { User } from 'src/user/entities/user/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, User, Merchant])],
  controllers: [ProductController],
  providers: [ProductService, MerchantService, UserService],
})
export class ProductModule {}
