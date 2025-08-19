import { Product } from 'src/product/entities/product.entity';
import { User } from 'src/user/entities/user/user.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'carts' })
export class Cart {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => Product, (product) => product.carts)
  product: Product;

  @Column({ default: 1 })
  quantity: number;

  @ManyToOne(() => User, (user) => user.carts, { nullable: false })
  user: User;
}
