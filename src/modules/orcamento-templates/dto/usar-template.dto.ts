import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum } from 'class-validator';

export class UsarTemplateDto {
  @IsString()
  @IsNotEmpty()
  nomeOrcamento: string;

  @IsEnum(['servico', 'produto'])
  @IsNotEmpty()
  tipo: 'servico' | 'produto';

  @IsNumber()
  @IsOptional()
  areaTotalM2?: number;

  @IsNumber()
  @IsOptional()
  metrosLineares?: number;

  @IsNumber()
  @IsOptional()
  pesoTotalProjeto?: number;

  @IsString()
  @IsOptional()
  codigoProjeto?: string;

  @IsString()
  @IsOptional()
  clienteNome?: string;
}
