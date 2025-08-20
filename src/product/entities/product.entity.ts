import { Cart } from 'src/cart/entities/cart.entity';
import { Merchant } from 'src/user/entities/merchant/merchant.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProductCategory, ProductStatus } from '../enums';
import { CartItem } from 'src/cart/entities/cart-item.entity';
import { OrderItem } from 'src/order/entities/order-item.entity';

@Entity({ name: 'products' })
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({
    type: 'enum',
    enum: ProductCategory,
  })
  category: ProductCategory;

  @Column({
    type: 'enum',
    enum: ProductStatus,
    default: ProductStatus.ACTIVE,
  })
  status?: ProductStatus;

  @Column({ nullable: true })
  discount?: number;

  @Column({ type: 'int', default: 0 })
  stockQuantity: number;

  @Column('simple-array', { nullable: true })
  images: string[];

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  weight: number; // For logistics calculations

  @Column({ nullable: true })
  brand: string;

  @Column({ nullable: true })
  model: string;

  @Column({ default: true })
  bnplEligible: boolean;

  @Column({ type: 'int', default: 4 })
  maxInstallments: number; // Maximum installment periods allowed

  @ManyToOne(() => Merchant, (merchant) => merchant.products)
  @JoinColumn({ name: 'merchantId' })
  merchant: Merchant;

  @Column()
  merchantId: string;

  @OneToMany(() => CartItem, (cartItem) => cartItem.product)
  cartItems: CartItem[];

  @OneToMany(() => OrderItem, (orderItem) => orderItem.product)
  orderItems: OrderItem[];

  @UpdateDateColumn()
  updatedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
