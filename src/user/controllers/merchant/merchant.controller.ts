import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { CreateMerchantDto } from 'src/user/dto/merchant/create-merchant.dto';
import { UpdateMerchantDto } from 'src/user/dto/merchant/update-merchant.dto';
import { MerchantService } from 'src/user/services/merchant/merchant.service';

@Controller('merchant')
export class MerchantController {
  constructor(private readonly merchantService: MerchantService) {}

  @Post('become-a-merchant')
  @UseGuards(AuthGuard)
  async becomeAMerchant(
    @Request() req,
    @Body() createMerchantDto: CreateMerchantDto,
  ) {
    const userId = req.user.id;
    return this.merchantService.becomeAMerchant(userId, createMerchantDto);
  }

  @Get('profile')
  @UseGuards(AuthGuard)
  async getMerchantProfile(@Request() req) {
    const userId = req.user.id;
    return this.merchantService.getMerchantProfile(userId);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async getMerchantById(@Param('id') merchantId: string) {
    return this.merchantService.getMerchantById(merchantId);
  }

  @Get('validate-business-name')
  @UseGuards(AuthGuard)
  async validateMerchantBusinessName(
    @Query('businessName') businessName: string,
  ) {
    return this.merchantService.validateMerchantBusinessName(businessName);
  }

  @Patch('profile')
  @UseGuards(AuthGuard)
  async updateProfile(
    @Request() req,
    @Body() updateProfileDto: UpdateMerchantDto,
  ) {
    const userId = req.user.id;
    return this.merchantService.updateProfile(userId, updateProfileDto);
  }
}
