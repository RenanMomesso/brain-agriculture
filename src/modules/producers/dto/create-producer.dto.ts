import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { IsCpfOrCnpj } from '../../../common/validators/is-cpf-or-cnpj.decorator';
import { FarmDto } from './farm.dto';

export class CreateProducerDto {
  @ApiProperty({
    description: 'CPF ou CNPJ do produtor (com ou sem pontuação)',
    example: '52998224725',
  })
  @IsString()
  @IsNotEmpty()
  @IsCpfOrCnpj()
  document: string;

  @ApiProperty({
    description: 'Nome do produtor',
    example: 'João Alves Pereira',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(140)
  name: string;

  @ApiPropertyOptional({
    description: 'Fazendas do produtor',
    type: [FarmDto],
    maxItems: 50,
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => FarmDto)
  farms?: FarmDto[];
}

export class UpdateProducerDto {
  @ApiPropertyOptional({
    description: 'Nome do produtor',
    example: 'João Alves Pereira',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(140)
  name?: string;

  @ApiPropertyOptional({
    description: 'Fazendas do produtor (substitui a lista atual)',
    type: [FarmDto],
    maxItems: 50,
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => FarmDto)
  farms?: FarmDto[];
}
