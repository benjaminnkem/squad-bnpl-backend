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
import { CheckoutService } from './services/checkout.service';
import { Payment } from 'src/payment/entities/payment.entity';
import { Installment } from 'src/installment/entities/installment.entity';
import { InstallmentPlan } from 'src/installment-plan/entities/installment-plan.entity';
import { OrderItem } from 'src/order/entities/order-item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Cart,
      Product,
      User,
      Order,
      OrderItem,
      Payment,
      Installment,
      InstallmentPlan,
    ]),
  ],
  controllers: [CartController, OrderController],
  providers: [
    CartService,
    PaymentService,
    SquadService,
    OrderService,
    CheckoutService,
  ],
  exports: [CartService],
})
export class CartModule {}
