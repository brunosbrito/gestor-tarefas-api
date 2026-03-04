import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsEnum,
  IsObject,
  IsBoolean,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class TributosDto {
  @IsBoolean()
  @IsOptional()
  temISS?: boolean;

  @IsNumber()
  @IsOptional()
  aliquotaISS?: number;

  @IsNumber()
  @IsOptional()
  aliquotaSimples?: number;
}

export class CreateOrcamentoDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsEnum(['servico', 'produto'])
  @IsNotEmpty()
  tipo: 'servico' | 'produto';

  @IsString()
  @IsOptional()
  clienteNome?: string;

  @IsString()
  @IsOptional()
  clienteCnpj?: string;

  @IsString()
  @IsOptional()
  codigoProjeto?: string;

  @IsNumber()
  @IsOptional()
  areaTotalM2?: number;

  @IsNumber()
  @IsOptional()
  metrosLineares?: number;

  @IsNumber()
  @IsOptional()
  pesoTotalProjeto?: number;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => TributosDto)
  tributos?: TributosDto;
}
