import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Merchant } from '../merchant/merchant.entity';
import { Order } from 'src/order/entities/order.entity';
import { Cart } from 'src/cart/entities/cart.entity';
import { Payment } from 'src/payment/entities/payment.entity';
import { UserStatus } from 'src/user/enums';
import { Favorite } from 'src/favorite/entities/favorite.entity';
import { Wallet } from 'src/wallet/entities/wallet.entity';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  username: string;

  @Column()
  @Exclude()
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true, unique: true })
  phone: string;

  @Column({ nullable: true })
  dp: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 50000 })
  bnplLimit: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  availableLimit: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  usedLimit: number;

  @Column({ type: 'int', default: 0 })
  creditScore: number;

  @Column({ nullable: true })
  bvn: string;

  @Column({ nullable: true })
  nin: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  state: string;

  @Column({ nullable: true })
  referralCode: string;

  @Column({ nullable: true })
  referredBy: string;

  @Column({ default: false })
  isAdmin: boolean;

  @Column({ default: false })
  isVerified: boolean;

  @OneToOne(() => Merchant, (merchant) => merchant.user, {
    nullable: true,
  })
  @JoinColumn()
  merchant: Merchant;

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @OneToMany(() => Cart, (cart) => cart.user)
  carts: Cart[];

  @OneToMany(() => Favorite, (favorite) => favorite.user)
  favorites: Favorite[];

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.PENDING_VERIFICATION,
  })
  status: UserStatus;

  @OneToMany(() => Payment, (payment) => payment.user)
  payments: Payment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
