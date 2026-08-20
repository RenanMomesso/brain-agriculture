import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('health')
@Controller()
export class AppController {
  @Get('health')
  @ApiOperation({ summary: 'Verifica a saúde da aplicação' })
  @ApiResponse({ status: 200, description: 'Aplicação saudável' })
  health() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
