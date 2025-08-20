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
  Put,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { UpdateCartDto } from './dto/update-cart.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AddToCartDto } from './dto/create-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Request() req, @Body() createCartDto: AddToCartDto) {
    return this.cartService.addToCart(req.user?.userId, createCartDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Request() req) {
    return this.cartService.getOrCreateCart(req.user?.userId);
  }

  @Put('items/:id')
  @UseGuards(JwtAuthGuard)
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateCartDto: UpdateCartItemDto,
  ) {
    return this.cartService.updateCartItem(req.user.userId, id, updateCartDto);
  }

  @Put('items/:id')
  @UseGuards(JwtAuthGuard)
  removeItem(
    @Request() req,
    @Param('id') id: string,
    @Body() updateCartDto: UpdateCartDto,
  ) {
    return this.cartService.removeCartItem(req.user.userId, id);
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  remove(@Request() req) {
    return this.cartService.clearCart(req.user?.userId);
  }

  @Get('count')
  @UseGuards(JwtAuthGuard)
  getCount(@Request() req) {
    return this.cartService.getCartItemsCount(req.user?.userId);
  }

  @Post('validate')
  @UseGuards(JwtAuthGuard)
  validateCart(@Request() req) {
    return this.cartService.validateCartForCheckout(req.user?.userId);
  }
}
