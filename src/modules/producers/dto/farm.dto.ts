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
  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  @IsIn(Crop.VALID_NAMES, {
    message: `name deve ser um dos seguintes valores: ${Crop.VALID_NAMES.join(', ')}`,
  })
  name: string;
}

export class HarvestDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  label: string;

  @Type(() => Number)
  @IsInt()
  @Min(1900)
  year: number;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => CropDto)
  crops?: CropDto[];
}

@FarmAreasValid()
export class FarmDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(140)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  city: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(STATE_UFS, {
    message: 'state deve ser uma UF brasileira válida (ex.: SP, MG, PR)',
  })
  state: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  totalArea: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  agriculturalArea: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  vegetationArea: number;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => HarvestDto)
  harvests?: HarvestDto[];
}
