import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,

    private readonly dataSource: DataSource,
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

  async findOne(userId: string, id: string) {
    const order = await this.orderRepository.findOne({ where: { id, userId } });
    return order;
  }

  update(id: string, updateOrderDto: UpdateOrderDto) {
    return this.orderRepository.update(id, updateOrderDto);
  }

  remove(id: string) {
    return this.orderRepository.delete(id);
  }
}
