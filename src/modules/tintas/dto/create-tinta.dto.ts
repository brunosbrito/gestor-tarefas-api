import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { TipoTinta } from '../entities/tinta.entity';

export class CreateTintaDto {
  @IsString()
  @IsNotEmpty()
  codigo: string;

  @IsString()
  @IsNotEmpty()
  descricao: string;

  @IsEnum(TipoTinta)
  @IsNotEmpty()
  tipo: TipoTinta;

  @IsNumber()
  @IsNotEmpty()
  solidosVolume: number;

  @IsNumber()
  @IsNotEmpty()
  precoLitro: number;

  @IsString()
  @IsNotEmpty()
  fornecedor: string;

  @IsString()
  @IsOptional()
  observacoes?: string;

  @IsBoolean()
  @IsOptional()
  ativo?: boolean;
}
