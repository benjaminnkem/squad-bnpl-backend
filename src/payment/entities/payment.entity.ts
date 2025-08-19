import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  PaymentDirection,
  PaymentPurpose,
  PaymentStatus,
  SquadPaymentMethod,
} from '../enums';
import { User } from 'src/user/entities/user/user.entity';
import { Merchant } from 'src/user/entities/merchant/merchant.entity';

@Entity({ name: 'payments' })
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column()
  paymentDate: Date;

  @Column({
    type: 'enum',
    enum: SquadPaymentMethod,
    default: SquadPaymentMethod.CARD,
  })
  method: SquadPaymentMethod;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Column({
    type: 'enum',
    enum: PaymentDirection,
    default: PaymentDirection.INFLOW,
  })
  direction: PaymentDirection;

  @Column({ type: 'enum', enum: PaymentPurpose, default: PaymentPurpose.ORDER })
  purpose: PaymentPurpose;

  @ManyToOne(() => User, (user) => user.payments)
  user: User;

  @ManyToOne(() => Merchant, (merchant) => merchant.payments)
  merchant: Merchant;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
