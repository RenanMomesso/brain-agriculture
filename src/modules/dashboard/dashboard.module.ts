import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Farm } from '../producers/entities/farm.entity';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [TypeOrmModule.forFeature([Farm])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
