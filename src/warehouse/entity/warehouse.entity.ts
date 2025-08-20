import { Delivery } from 'src/delivery/entity/delivery.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

export enum WarehouseStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance',
}

@Entity('warehouses')
export class Warehouse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  code: string; // e.g., LOS-001, ABJ-001, PHC-001

  @Column()
  address: string;

  @Column()
  city: string;

  @Column()
  state: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  managerName: string;

  @Column({ nullable: true })
  managerPhone: string;

  @Column({
    type: 'enum',
    enum: WarehouseStatus,
    default: WarehouseStatus.ACTIVE,
  })
  status: WarehouseStatus;

  @Column({ type: 'decimal', precision: 10, scale: 6 })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 6 })
  longitude: number;

  @Column({ default: true })
  isOperational: boolean;

  @OneToMany(() => Delivery, (delivery) => delivery.warehouse)
  deliveries: Delivery[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
