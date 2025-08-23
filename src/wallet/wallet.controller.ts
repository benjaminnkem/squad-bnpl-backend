import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Request() req) {
    const userId = req.user.userId;
    return this.walletService.getOrCreate('');
  }
}
