import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from './entities/cart.entity';
import { Product } from 'src/product/entities/product.entity';
import { User } from 'src/user/entities/user/user.entity';
import { PaymentService } from 'src/payment/payment.service';
import { SquadService } from 'src/payment/services/squad.service';
import { Order } from 'src/order/entities/order.entity';
import { OrderService } from 'src/order/order.service';
import { OrderController } from 'src/order/order.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Cart, Product, User, Order])],
  controllers: [CartController, OrderController],
  providers: [CartService, PaymentService, SquadService, OrderService],
})
export class CartModule {}
