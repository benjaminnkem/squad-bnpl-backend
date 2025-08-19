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
import { CartService } from './cart.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CheckoutDto } from './dto/checkout.dto';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Request() req, @Body() createCartDto: CreateCartDto) {
    return this.cartService.addToCart(req.user?.userId, createCartDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Request() req) {
    return this.cartService.findAll(req.user?.userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Request() req, @Param('id') id: string) {
    return this.cartService.findOne(req.user?.userId, id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateCartDto: UpdateCartDto,
  ) {
    return this.cartService.update(req.user.userId, id, updateCartDto);
  }

  @Delete(':productId')
  @UseGuards(JwtAuthGuard)
  remove(@Request() req, @Param('productId') productId: string) {
    return this.cartService.remove(req.user?.userId, productId);
  }

  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  checkout(@Request() req, @Body() checkoutDto: CheckoutDto) {
    return this.cartService.checkout(req.user?.userId, checkoutDto);
  }
}
