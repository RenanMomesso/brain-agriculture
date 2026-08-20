import {
  Column,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Crop } from './crop.entity';
import { Farm } from './farm.entity';

@Entity('harvests')
@Index('IDX_harvests_farm_id', ['farmId'])
export class Harvest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 80 })
  label: string;

  @Column({ type: 'int' })
  year: number;

  @ManyToOne(() => Farm, (farm) => farm.harvests, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'farm_id' })
  farm: Farm;

  @Column({ name: 'farm_id', type: 'uuid' })
  farmId: string;

  @ManyToMany(() => Crop, (crop) => crop.harvests, {
    cascade: ['insert'],
    eager: true,
  })
  @JoinTable({ name: 'harvest_crops' })
  crops: Crop[];
}
