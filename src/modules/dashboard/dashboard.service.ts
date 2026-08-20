import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Farm } from '../producers/entities/farm.entity';

export interface DashboardData {
  totalFarms: number;
  totalAreaHectares: number;
  farmsByState: Array<{ state: string; farmCount: number }>;
  farmsByCrop: Array<{ crop: string; farmCount: number }>;
  landUse: { agriculturalAreaHectares: number; vegetationAreaHectares: number };
}

interface TotalsRow {
  farmCount?: string;
  totalArea?: string;
}

interface GroupedRow {
  state?: string;
  crop?: string;
  farmCount?: string;
}

interface LandUseRow {
  agricultural?: string;
  vegetation?: string;
}

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(
    @InjectRepository(Farm)
    private readonly farmRepository: Repository<Farm>,
  ) {}

  async getDashboard(): Promise<DashboardData> {
    const [totals, farmsByState, farmsByCrop, landUse] = await Promise.all([
      this.getTotals(),
      this.getFarmsByState(),
      this.getFarmsByCrop(),
      this.getLandUse(),
    ]);

    const dashboard: DashboardData = {
      totalFarms: totals.farmCount,
      totalAreaHectares: totals.totalArea,
      farmsByState,
      farmsByCrop,
      landUse,
    };

    this.logger.log('Dashboard consultado');
    return dashboard;
  }

  private async getTotals(): Promise<{ farmCount: number; totalArea: number }> {
    const result = await this.farmRepository
      .createQueryBuilder('farm')
      .select('COUNT(farm.id)', 'farmCount')
      .addSelect('COALESCE(SUM(farm.totalArea), 0)', 'totalArea')
      .getRawOne<TotalsRow>();

    return {
      farmCount: Number(result?.farmCount ?? 0),
      totalArea: Number(result?.totalArea ?? 0),
    };
  }

  private async getFarmsByState(): Promise<
    Array<{ state: string; farmCount: number }>
  > {
    const rows = await this.farmRepository
      .createQueryBuilder('farm')
      .select('farm.state', 'state')
      .addSelect('COUNT(farm.id)', 'farmCount')
      .groupBy('farm.state')
      .orderBy('farmCount', 'DESC')
      .getRawMany<GroupedRow>();

    return rows.map((row) => ({
      state: row.state ?? '',
      farmCount: Number(row.farmCount ?? 0),
    }));
  }

  private async getFarmsByCrop(): Promise<
    Array<{ crop: string; farmCount: number }>
  > {
    const rows = await this.farmRepository
      .createQueryBuilder('farm')
      .innerJoin('farm.harvests', 'harvest')
      .innerJoin('harvest.crops', 'crop')
      .select('crop.name', 'crop')
      .addSelect('COUNT(DISTINCT farm.id)', 'farmCount')
      .groupBy('crop.name')
      .orderBy('farmCount', 'DESC')
      .getRawMany<GroupedRow>();

    return rows.map((row) => ({
      crop: row.crop ?? '',
      farmCount: Number(row.farmCount ?? 0),
    }));
  }

  private async getLandUse(): Promise<{
    agriculturalAreaHectares: number;
    vegetationAreaHectares: number;
  }> {
    const result = await this.farmRepository
      .createQueryBuilder('farm')
      .select('COALESCE(SUM(farm.agriculturalArea), 0)', 'agricultural')
      .addSelect('COALESCE(SUM(farm.vegetationArea), 0)', 'vegetation')
      .getRawOne<LandUseRow>();

    return {
      agriculturalAreaHectares: Number(result?.agricultural ?? 0),
      vegetationAreaHectares: Number(result?.vegetation ?? 0),
    };
  }
}
