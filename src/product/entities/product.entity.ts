import { Merchant } from 'src/user/entities/merchant/merchant.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'products' })
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column()
  name: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column('text', { array: true, default: [] })
  images: string[];

  @ManyToOne(() => Merchant, (merchant) => merchant.products)
  merchant: Merchant;
}
