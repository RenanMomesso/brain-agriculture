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
  @IsString()
  @IsNotEmpty()
  @IsCpfOrCnpj()
  document: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(140)
  name: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => FarmDto)
  farms?: FarmDto[];
}

export class UpdateProducerDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(140)
  name?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => FarmDto)
  farms?: FarmDto[];
}
