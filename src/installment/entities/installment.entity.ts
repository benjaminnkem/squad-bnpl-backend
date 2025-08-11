import { InstallmentPlan } from 'src/installment-plan/entities/installment-plan.entity';
import { Payment } from 'src/payment/entities/payment.entity';
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

@Entity({ name: 'installments' })
export class Installment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => InstallmentPlan, (plan) => plan.installments)
  plan: InstallmentPlan;

  @Column()
  dueDate: Date;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({ default: false })
  paid: boolean;

  @OneToOne(() => Payment, { nullable: true })
  @JoinColumn()
  payment: Payment;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
