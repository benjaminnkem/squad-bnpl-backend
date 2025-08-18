import { Product } from 'src/product/entities/product.entity';
import {
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../user/user.entity';

enum MerchantStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  SUSPENDED = 'suspended',
}

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

  @Column({
    default: MerchantStatus.PENDING,
    type: 'enum',
    enum: MerchantStatus,
  })
  merchantStatus: MerchantStatus;

  @OneToMany(() => Product, (product) => product.merchant)
  products: Product[];

  @OneToOne(() => User, (user) => user.merchant)
  user: User;
}
