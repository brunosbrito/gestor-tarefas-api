import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsEnum,
  Min,
} from 'class-validator';
import { TipoMobilizacao, CategoriaMobilizacao } from '../entities/mobilizacao.entity';

export class CreateMobilizacaoDto {
  @IsEnum(TipoMobilizacao)
  @IsNotEmpty()
  tipo: TipoMobilizacao;

  @IsString()
  @IsNotEmpty()
  codigo: string;

  @IsString()
  @IsNotEmpty()
  descricao: string;

  @IsEnum(CategoriaMobilizacao)
  @IsNotEmpty()
  categoria: CategoriaMobilizacao;

  @IsString()
  @IsOptional()
  unidade?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  precoUnitario?: number;

  @IsString()
  @IsOptional()
  observacoes?: string;

  @IsBoolean()
  @IsOptional()
  ativo?: boolean;
}
