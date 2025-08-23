import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { FavoriteService } from './favorite.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('favorite')
export class FavoriteController {
  constructor(private readonly favoriteService: FavoriteService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createFavoriteDto: CreateFavoriteDto, @Request() req) {
    const userId = req.user.userId;
    return this.favoriteService.create(userId, createFavoriteDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Request() req) {
    const userId = req.user.userId;
    return this.favoriteService.findAll(userId);
  }

  @Delete(':productId')
  @UseGuards(JwtAuthGuard)
  remove(@Param('productId') productId: string, @Request() req) {
    const userId = req.user.userId;
    return this.favoriteService.remove(productId, userId);
  }
}
