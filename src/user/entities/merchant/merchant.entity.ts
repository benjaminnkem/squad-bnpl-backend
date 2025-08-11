import { Product } from 'src/product/entities/product.entity';
import {
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../user/user.entity';

@Entity({ name: 'merchants' })
export class Merchant {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column()
  businessName: string;

  @Column()
  email: string;

  @OneToMany(() => Product, (product) => product.merchant)
  products: Product[];

  @OneToOne(() => User, (user) => user.merchant, {
    eager: true,
  })
  user: User;
}
