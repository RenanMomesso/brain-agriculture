import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { STATE_UFS } from '../../../common/enums/crop-type.enum';
import { FarmAreasValid } from '../../../common/validators/farm-areas.constraint';
import { Crop } from '../entities/crop.entity';

export class CropDto {
  @ApiProperty({
    description: 'Nome da cultura plantada',
    enum: Crop.VALID_NAMES,
    example: 'SOJA',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  @IsIn(Crop.VALID_NAMES, {
    message: `name deve ser um dos seguintes valores: ${Crop.VALID_NAMES.join(', ')}`,
  })
  name: string;
}

export class HarvestDto {
  @ApiProperty({
    description: 'Identificação da safra',
    example: 'Safra 2022/2023',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  label: string;

  @ApiProperty({ description: 'Ano da safra', example: 2023 })
  @Type(() => Number)
  @IsInt()
  @Min(1900)
  year: number;

  @ApiPropertyOptional({
    description: 'Culturas plantadas na safra',
    type: [CropDto],
    maxItems: 20,
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => CropDto)
  crops?: CropDto[];
}

@FarmAreasValid()
export class FarmDto {
  @ApiProperty({ description: 'Nome da fazenda', example: 'Sítio São José' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(140)
  name: string;

  @ApiProperty({ description: 'Cidade da fazenda', example: 'Cascavel' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  city: string;

  @ApiProperty({
    description: 'UF (estado) da fazenda',
    enum: STATE_UFS,
    example: 'PR',
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(STATE_UFS, {
    message: 'state deve ser uma UF brasileira válida (ex.: SP, MG, PR)',
  })
  state: string;

  @ApiProperty({
    description: 'Área total da fazenda em hectares',
    example: 150,
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  totalArea: number;

  @ApiProperty({
    description: 'Área agricultável em hectares',
    example: 120,
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  agriculturalArea: number;

  @ApiProperty({
    description: 'Área de vegetação em hectares',
    example: 30,
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  vegetationArea: number;

  @ApiPropertyOptional({
    description: 'Safras da fazenda',
    type: [HarvestDto],
    maxItems: 20,
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => HarvestDto)
  harvests?: HarvestDto[];
}
