import { Module } from '@nestjs/common';
import { AppService } from './app/services/app.service';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app/controllers/app.controller';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './_lib/config/data-source.config';
import { MailerModule } from '@nestjs-modules/mailer';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import { config } from './_lib/config/enviroment.config';
import { join } from 'path';
import { UserModule } from './user/user.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { UploadModule } from './upload/upload.module';
import { CartModule } from './cart/cart.module';
import { ProductModule } from './product/product.module';
import { OrderModule } from './order/order.module';
import { InstallmentModule } from './installment/installment.module';
import { InstallmentPlanModule } from './installment-plan/installment-plan.module';
import { PaymentModule } from './payment/payment.module';
import { BullModule } from '@nestjs/bullmq';
import { DeliveryModule } from './delivery/delivery.module';
import { NotificationModule } from './notification/notification.module';
import { WarehouseModule } from './warehouse/warehouse.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    TypeOrmModule.forRoot(dataSourceOptions),
    BullModule.forRoot({
      connection: {
        host: 'localhost',
        port: 6379,
      },
      defaultJobOptions: { attempts: 3 },
    }),
    MailerModule.forRoot({
      transport: {
        service: 'gmail',
        auth: {
          user: config.mail.user,
          pass: config.mail.pass,
        },
      },
      defaults: {
        from: '"SmartPay Team" <noreply@smartpay.com>',
      },
      template: {
        dir: join(process.cwd(), 'src', '_lib', 'templates'),
        adapter: new EjsAdapter(),
      },
    }),
    UserModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    UploadModule,
    CartModule,
    ProductModule,
    OrderModule,
    InstallmentModule,
    InstallmentPlanModule,
    PaymentModule,
    DeliveryModule,
    NotificationModule,
    WarehouseModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
