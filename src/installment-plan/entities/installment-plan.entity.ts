import { Installment } from 'src/installment/entities/installment.entity';
import { Order } from 'src/order/entities/order.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'installment_plans' })
export class InstallmentPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Order, (order) => order.installmentPlan)
  @JoinColumn()
  order: Order;

  @Column()
  numberOfInstallments: number;

  @Column('decimal', { precision: 10, scale: 2 })
  installmentAmount: number;

  @Column({ default: 'active' })
  status: 'active' | 'completed' | 'defaulted';

  @OneToMany(() => Installment, (installment) => installment.plan)
  installments: Installment[];

  @CreateDateColumn()
  createdAt: Date;
}
