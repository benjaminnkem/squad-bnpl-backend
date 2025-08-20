import { Installment } from 'src/installment/entities/installment.entity';
import { Order } from 'src/order/entities/order.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { InstallmentPlanStatus } from '../enums';

@Entity('installment_plans')
export class InstallmentPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: InstallmentPlanStatus,
    default: InstallmentPlanStatus.ACTIVE,
  })
  status: InstallmentPlanStatus;

  @Column({ type: 'int' })
  totalInstallments: number;

  @Column({ type: 'int', default: 0 })
  paidInstallments: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  installmentAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalPaid: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  remainingAmount: number;

  @Column({ nullable: true })
  nextDueDate: Date;

  @Column({ type: 'int', default: 0 })
  missedPayments: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  lateFees: number;

  @OneToOne(() => Order, (order) => order.installmentPlan)
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @Column()
  orderId: string;

  @OneToMany(() => Installment, (installment) => installment.installmentPlan)
  installments: Installment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
