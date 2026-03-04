import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { MaterialCategoria } from '../entities/material-catalogo.entity';

export class CreateMaterialCatalogoDto {
  @IsString()
  @IsNotEmpty()
  codigo: string;

  @IsString()
  @IsNotEmpty()
  descricao: string;

  @IsEnum(MaterialCategoria)
  @IsNotEmpty()
  categoria: MaterialCategoria;

  @IsString()
  @IsNotEmpty()
  fornecedor: string;

  @IsString()
  @IsNotEmpty()
  unidade: string;

  @IsNumber()
  @IsNotEmpty()
  precoUnitario: number;

  @IsNumber()
  @IsOptional()
  precoKg?: number;

  @IsNumber()
  @IsOptional()
  pesoNominal?: number;

  @IsNumber()
  @IsOptional()
  perimetroM?: number;

  @IsNumber()
  @IsOptional()
  areaM2PorMetroLinear?: number;

  @IsString()
  @IsOptional()
  especificacao?: string;

  @IsString()
  @IsOptional()
  observacoes?: string;

  @IsBoolean()
  @IsOptional()
  ativo?: boolean;
}
