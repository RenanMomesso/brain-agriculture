import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { CROP_TYPES } from '../../../common/enums/crop-type.enum';
import { Harvest } from './harvest.entity';

@Entity('crops')
export class Crop {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 40 })
  name: string;

  @ManyToMany(() => Harvest, (harvest) => harvest.crops)
  harvests: Harvest[];

  static readonly VALID_NAMES: readonly string[] = CROP_TYPES;
}
