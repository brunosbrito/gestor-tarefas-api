import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { CategoriaConsumivel } from '../entities/consumivel.entity';

export class CreateConsumivelDto {
  @IsString()
  @IsNotEmpty()
  codigo: string;

  @IsString()
  @IsNotEmpty()
  descricao: string;

  @IsEnum(CategoriaConsumivel)
  @IsNotEmpty()
  categoria: CategoriaConsumivel;

  @IsString()
  @IsNotEmpty()
  unidade: string;

  @IsNumber()
  @IsNotEmpty()
  precoUnitario: number;

  @IsString()
  @IsOptional()
  fornecedor?: string;

  @IsString()
  @IsOptional()
  especificacao?: string;

  @IsNumber()
  @IsOptional()
  rendimento?: number;

  @IsString()
  @IsOptional()
  observacoes?: string;

  @IsBoolean()
  @IsOptional()
  ativo?: boolean;
}
