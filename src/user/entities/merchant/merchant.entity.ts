import { Product } from 'src/product/entities/product.entity';
import {
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../user/user.entity';
import { Payment } from 'src/payment/entities/payment.entity';
import { MerchantStatus, MerchantTier } from 'src/user/enums';
import { Order } from 'src/order/entities/order.entity';
import { Wallet } from 'src/wallet/entities/wallet.entity';

@Entity({ name: 'merchants' })
export class Merchant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  businessName: string;

  @Column({ unique: true })
  registrationNumber: string;

  @Column()
  email: string;

  @Column()
  address: string;

  @Column()
  phone: string;

  @Column()
  photo: string;

  @Column()
  category: string;

  @Column({ nullable: true })
  coverPhoto: string;

  @Column({ nullable: true })
  bio: string;

  @Column({ nullable: true })
  website?: string;

  @OneToOne(() => Wallet, (wallet) => wallet.merchant)
  wallet: Wallet;

  @Column({
    type: 'enum',
    enum: MerchantStatus,
    default: MerchantStatus.PENDING_APPROVAL,
  })
  status: MerchantStatus;

  @Column({
    type: 'enum',
    enum: MerchantTier,
    default: MerchantTier.BASIC,
  })
  tier: MerchantTier;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 3.5 })
  serviceFeePct: number; // 3-5% service fee

  @Column({ nullable: true })
  cacNumber: string;

  @Column({ nullable: true })
  businessAddress: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  state: string;

  @Column({ nullable: true })
  bankName: string;

  @Column({ nullable: true })
  bankAccountNumber: string;

  @Column({ nullable: true })
  bankAccountName: string;

  @Column({ default: true })
  autoSettlement: boolean;

  @Column({ type: 'int', default: 1 }) // Settlement frequency in days
  settlementFrequency: number;

  @OneToMany(() => Product, (product) => product.merchant)
  products: Product[];

  @OneToMany(() => Order, (order) => order.merchant)
  orders: Order[];

  @OneToOne(() => User, (user) => user.merchant)
  user: User;
}
