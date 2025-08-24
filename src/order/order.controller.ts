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
  Query,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { OrderStatus } from './enums';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.orderService.create(createOrderDto);
  }

  @Get()
  findAll() {
    return this.orderService.findAll();
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMyOrders(@Request() req, @Query('status') status?: OrderStatus) {
    return this.orderService.getMyOrders(
      req.user.userId,
      status?.toLocaleLowerCase() === 'all' ? undefined : status,
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string, @Request() req) {
    return this.orderService.getOrderById(req.user.userId, id);
  }

  @Get(':orderId/items')
  @UseGuards(JwtAuthGuard)
  getOrderItems(@Param('orderId') orderId: string, @Request() req) {
    return this.orderService.getOrderItems(req.user.userId, orderId);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
  //   return this.orderService.update(id, updateOrderDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.orderService.remove(id);
  // }
}
