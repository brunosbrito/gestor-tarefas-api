import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsObject,
  IsArray,
  IsBoolean,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TemplateCategoriaEnum } from '../entities/orcamento-template.entity';

class TributosTemplateDto {
  @IsOptional()
  iss?: number;

  @IsOptional()
  simples?: number;

  @IsOptional()
  total?: number;
}

class ConfiguracoesTemplateDto {
  @IsOptional()
  bdi?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => TributosTemplateDto)
  tributos?: TributosTemplateDto;

  @IsOptional()
  encargos?: number;
}

export class CreateOrcamentoTemplateDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsString()
  @IsOptional()
  descricao?: string;

  @IsEnum(TemplateCategoriaEnum)
  @IsOptional()
  categoria?: TemplateCategoriaEnum;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => ConfiguracoesTemplateDto)
  configuracoes?: ConfiguracoesTemplateDto;

  @IsArray()
  @IsOptional()
  composicoesTemplate?: any[];

  @IsBoolean()
  @IsOptional()
  ativo?: boolean;
}
