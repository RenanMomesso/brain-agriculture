import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import {
  CreateProducerDto,
  UpdateProducerDto,
} from './dto/create-producer.dto';
import { ProducersService } from './producers.service';

@ApiTags('producers')
@Controller('producers')
export class ProducersController {
  constructor(private readonly producersService: ProducersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Cadastra um produtor rural com suas fazendas, safras e culturas',
  })
  @ApiResponse({ status: 201, description: 'Produtor criado' })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos (CPF/CNPJ, áreas, culturas)',
  })
  @ApiResponse({ status: 409, description: 'Documento já cadastrado' })
  create(@Body() dto: CreateProducerDto) {
    return this.producersService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista produtores (paginado)' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiResponse({ status: 200, description: 'Lista de produtores' })
  findAll(@Query('page') page = '1', @Query('limit') limit = '10') {
    return this.producersService.findAll(
      Math.max(1, Number(page)),
      Math.min(100, Math.max(1, Number(limit))),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um produtor pelo id' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Produtor encontrado' })
  @ApiResponse({ status: 404, description: 'Produtor não encontrado' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.producersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Edita um produtor (nome e/ou substitui a lista de fazendas)',
  })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Produtor atualizado' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 404, description: 'Produtor não encontrado' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProducerDto,
  ) {
    return this.producersService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Exclui um produtor e todas as suas fazendas' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Produtor excluído' })
  @ApiResponse({ status: 404, description: 'Produtor não encontrado' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.producersService.remove(id);
  }
}
