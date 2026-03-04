import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  Min,
} from 'class-validator';

export class CreateEpiDto {
  @IsString()
  @IsNotEmpty()
  descricao: string;

  @IsString()
  @IsOptional()
  nomeResumido?: string;

  @IsString()
  @IsOptional()
  unidade?: string;

  @IsString()
  @IsOptional()
  ca?: string;

  @IsString()
  @IsOptional()
  fabricante?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  valorReferencia?: number;

  @IsBoolean()
  @IsOptional()
  ativo?: boolean;
}
