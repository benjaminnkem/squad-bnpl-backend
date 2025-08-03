import { Module } from '@nestjs/common';
import { UserService } from './services/user/user.service';
import { UserController } from './controllers/user/user.controller';
import { MerchantController } from './controllers/merchant/merchant.controller';
import { MerchantService } from './services/merchant/merchant.service';

@Module({
  controllers: [UserController, MerchantController],
  providers: [UserService, MerchantService],
})
export class UserModule {}
