import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsEnum,
  IsBoolean,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CategoriaCargo, GrauInsalubridade, TipoContrato, CustosDiversos } from '../entities/cargo.entity';

class ItemCustoRateadoDto {
  @IsString()
  descricao: string;

  @IsNumber()
  quantidade: number;

  @IsNumber()
  valorUnitario: number;
}

class CustoCompostoRateadoDto {
  @ValidateNested({ each: true })
  @Type(() => ItemCustoRateadoDto)
  itens: ItemCustoRateadoDto[];

  @IsNumber()
  periodoMeses: number;
}

class CustoAdmissionalDto {
  @IsNumber()
  valorPorEvento: number;

  @IsNumber()
  periodoMeses: number;
}

class AlimentacaoDto {
  @IsNumber()
  cafeManha: number;

  @IsNumber()
  almoco: number;

  @IsNumber()
  janta: number;

  @IsNumber()
  cestaBasica: number;
}

class CustosDiversosDto {
  @ValidateNested()
  @Type(() => AlimentacaoDto)
  alimentacao: AlimentacaoDto;

  @IsNumber()
  transporte: number;

  @ValidateNested()
  @Type(() => CustoCompostoRateadoDto)
  uniforme: CustoCompostoRateadoDto;

  @ValidateNested()
  @Type(() => CustoAdmissionalDto)
  despesasAdmissionais: CustoAdmissionalDto;

  @IsNumber()
  assistenciaMedica: number;

  @ValidateNested()
  @Type(() => CustoCompostoRateadoDto)
  epiEpc: CustoCompostoRateadoDto;

  @IsNumber()
  outros: number;
}

export class CreateCargoDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsString()
  @IsOptional()
  nivel?: string;

  @IsNumber()
  @IsNotEmpty()
  salarioBase: number;

  @IsBoolean()
  @IsOptional()
  temPericulosidade?: boolean;

  @IsEnum(GrauInsalubridade)
  @IsOptional()
  grauInsalubridade?: GrauInsalubridade;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => CustosDiversosDto)
  custos?: CustosDiversos;

  @IsNumber()
  @IsOptional()
  horasMes?: number;

  @IsEnum(TipoContrato)
  @IsOptional()
  tipoContrato?: TipoContrato;

  @IsEnum(CategoriaCargo)
  @IsOptional()
  categoria?: CategoriaCargo;

  @IsString()
  @IsOptional()
  observacoes?: string;

  @IsBoolean()
  @IsOptional()
  ativo?: boolean;
}
