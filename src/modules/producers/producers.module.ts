import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Crop } from './entities/crop.entity';
import { Farm } from './entities/farm.entity';
import { Harvest } from './entities/harvest.entity';
import { Producer } from './entities/producer.entity';
import { ProducersController } from './producers.controller';
import { ProducersService } from './producers.service';

@Module({
  imports: [TypeOrmModule.forFeature([Producer, Farm, Harvest, Crop])],
  controllers: [ProducersController],
  providers: [ProducersService],
  exports: [ProducersService, TypeOrmModule],
})
export class ProducersModule {}
