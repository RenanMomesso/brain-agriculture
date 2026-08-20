import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Harvest } from './harvest.entity';
import { Producer } from './producer.entity';

const numericTransformer = {
  to: (value: number): number => value,
  from: (value: string): number => parseFloat(value),
};

@Entity('farms')
@Index('IDX_farms_state', ['state'])
@Index('IDX_farms_producer_id', ['producerId'])
export class Farm {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 140 })
  name: string;

  @Column({ length: 120 })
  city: string;

  @Column({ length: 2 })
  state: string;

  @Column({
    type: 'numeric',
    precision: 14,
    scale: 2,
    transformer: numericTransformer,
  })
  totalArea: number;

  @Column({
    type: 'numeric',
    precision: 14,
    scale: 2,
    name: 'agricultural_area',
    transformer: numericTransformer,
  })
  agriculturalArea: number;

  @Column({
    type: 'numeric',
    precision: 14,
    scale: 2,
    name: 'vegetation_area',
    transformer: numericTransformer,
  })
  vegetationArea: number;

  @ManyToOne(() => Producer, (producer) => producer.farms, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'producer_id' })
  producer: Producer;

  @Column({ name: 'producer_id', type: 'uuid' })
  producerId: string;

  @OneToMany(() => Harvest, (harvest) => harvest.farm, {
    cascade: ['insert', 'update', 'remove'],
    eager: true,
  })
  harvests: Harvest[];
}
