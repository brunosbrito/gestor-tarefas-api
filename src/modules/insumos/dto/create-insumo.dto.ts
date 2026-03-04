import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { CategoriaInsumo } from '../entities/insumo.entity';

export class CreateInsumoDto {
  @IsString()
  @IsNotEmpty()
  codigo: string;

  @IsString()
  @IsNotEmpty()
  descricao: string;

  @IsEnum(['material', 'consumivel', 'tinta', 'mao_obra', 'ferramenta', 'equipamento', 'servico'])
  @IsNotEmpty()
  categoria: CategoriaInsumo;

  @IsString()
  @IsNotEmpty()
  unidade: string;

  @IsNumber()
  @IsNotEmpty()
  valorUnitario: number;

  // Campos específicos para materiais
  @IsString()
  @IsOptional()
  material?: string;

  @IsString()
  @IsOptional()
  especificacao?: string;

  @IsNumber()
  @IsOptional()
  pesoUnitario?: number;

  // Campos específicos para mão de obra
  @IsString()
  @IsOptional()
  cargo?: string;

  @IsNumber()
  @IsOptional()
  encargosPercentual?: number;

  // Campos específicos para tintas
  @IsString()
  @IsOptional()
  fabricante?: string;

  @IsNumber()
  @IsOptional()
  rendimento?: number;

  // Campos de controle
  @IsBoolean()
  @IsOptional()
  ativo?: boolean;

  @IsString()
  @IsOptional()
  observacao?: string;
}
