import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsEnum,
  IsBoolean,
  IsInt,
} from 'class-validator';
import { TipoFerramenta } from '../entities/ferramenta.entity';

export class CreateFerramentaDto {
  @IsString()
  @IsNotEmpty()
  codigo: string;

  @IsString()
  @IsNotEmpty()
  descricao: string;

  @IsEnum(TipoFerramenta)
  @IsNotEmpty()
  tipo: TipoFerramenta;

  @IsNumber()
  @IsNotEmpty()
  valorAquisicao: number;

  @IsInt()
  @IsOptional()
  vidaUtilMeses?: number;

  @IsString()
  @IsOptional()
  fabricante?: string;

  @IsString()
  @IsOptional()
  modelo?: string;

  @IsString()
  @IsOptional()
  potencia?: string;

  @IsString()
  @IsOptional()
  observacoes?: string;

  @IsBoolean()
  @IsOptional()
  ativo?: boolean;
}
