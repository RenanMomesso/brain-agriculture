import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';

@ApiTags('dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @ApiOperation({
    summary: 'Indicadores do dashboard (totais e dados para gráficos de pizza)',
  })
  @ApiResponse({ status: 200, description: 'Dados do dashboard' })
  getDashboard() {
    return this.dashboardService.getDashboard();
  }
}
