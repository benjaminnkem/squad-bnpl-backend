import { Merchant } from 'src/user/entities/merchant/merchant.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'products' })
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column()
  description: string;

  @Column()
  category: string;

  @Column({ nullable: true })
  discount?: number;

  @Column({ default: 1 })
  stock: number;

  @Column('text', { array: true, default: [] })
  images: string[];

  @ManyToOne(() => Merchant, (merchant) => merchant.products)
  merchant: Merchant;

  @UpdateDateColumn()
  updatedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
