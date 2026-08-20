import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Farm } from './farm.entity';

@Entity('producers')
export class Producer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 14 })
  document: string;

  @Column({ length: 140 })
  name: string;

  @OneToMany(() => Farm, (farm) => farm.producer, {
    cascade: ['insert', 'update', 'remove'],
    eager: true,
  })
  farms: Farm[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
