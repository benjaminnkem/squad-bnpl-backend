import { InstallmentPlan } from 'src/installment-plan/entities/installment-plan.entity';
import { Product } from 'src/product/entities/product.entity';
import { User } from 'src/user/entities/user/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'orders' })
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.orders)
  user: User;

  @ManyToOne(() => Product)
  product: Product;

  @Column('decimal', { precision: 10, scale: 2 })
  totalAmount: number;

  @Column({ default: 'pending' })
  status: 'pending' | 'paid' | 'defaulted';

  @OneToOne(() => InstallmentPlan, (plan) => plan.order)
  installmentPlan: InstallmentPlan;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
