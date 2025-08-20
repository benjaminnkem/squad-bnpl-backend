import { InstallmentPlan } from 'src/installment-plan/entities/installment-plan.entity';
import { Payment } from 'src/payment/entities/payment.entity';
import { Merchant } from 'src/user/entities/merchant/merchant.entity';
import { User } from 'src/user/entities/user/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { OrderItem } from './order-item.entity';
import { OrderStatus, PaymentType } from '../enums';
import { Delivery } from 'src/delivery/entity/delivery.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  orderNumber: string;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Column({
    type: 'enum',
    enum: PaymentType,
  })
  paymentType: PaymentType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  shippingFee: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  serviceFee: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  finalAmount: number;

  @Column('text', { nullable: true })
  notes: string;

  // Shipping Address
  @Column()
  shippingAddress: string;

  @Column()
  shippingCity: string;

  @Column()
  shippingState: string;

  @Column({ nullable: true })
  shippingPhone: string;

  @ManyToOne(() => User, (user) => user.orders)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Merchant, (merchant) => merchant.orders)
  @JoinColumn({ name: 'merchantId' })
  merchant: Merchant;

  @Column()
  merchantId: string;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, { cascade: true })
  items: OrderItem[];

  @OneToMany(() => Payment, (payment) => payment.order)
  payments: Payment[];

  @OneToOne(() => InstallmentPlan, (installmentPlan) => installmentPlan.order)
  installmentPlan: InstallmentPlan;

  @OneToOne(() => Delivery, (delivery) => delivery.order)
  delivery: Delivery;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
