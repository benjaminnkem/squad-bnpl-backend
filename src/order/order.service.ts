import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { DataSource, Repository } from 'typeorm';
import { OrderItem } from './entities/order-item.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,

    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
  ) {}

  create(createOrderDto: CreateOrderDto) {
    const order = this.orderRepository.create(createOrderDto);
    return this.orderRepository.save(order);
  }

  async getMyOrders(userId: string) {
    return await this.orderRepository.find({
      where: { userId },
      relations: ['merchant'],
      select: {
        merchant: { id: true, businessName: true, photo: true },
      },
      order: { createdAt: 'DESC' },
    });
  }

  findAll() {
    return this.orderRepository.find();
  }

  async getOrderById(userId: string, id: string) {
    const order = await this.orderRepository.findOne({
      where: { id, userId },
      relations: ['merchant'],
      select: {
        merchant: { id: true, businessName: true, photo: true },
      },
    });
    return order;
  }

  async getOrderItems(userId: string, id: string) {
    const order = await this.getOrderById(userId, id);
    if (!order) throw new NotFoundException('Order not found');

    return this.orderItemRepository.find({
      where: { orderId: order.id },
      relations: ['product'],
      select: {
        product: {
          id: true,
          name: true,
          price: true,
          images: true,
          description: true,
        },
      },
    });
  }

  update(id: string, updateOrderDto: UpdateOrderDto) {
    return this.orderRepository.update(id, updateOrderDto);
  }

  remove(id: string) {
    return this.orderRepository.delete(id);
  }
}
