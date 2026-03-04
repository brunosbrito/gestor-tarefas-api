import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsObject,
  IsBoolean,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class TributosDto {
  @IsBoolean()
  @IsOptional()
  temISS?: boolean;

  @IsNumber()
  @IsOptional()
  aliquotaISS?: number;

  @IsNumber()
  @IsOptional()
  aliquotaSimples?: number;
}

class ConfiguracoesDto {
  @IsNumber()
  @IsOptional()
  bdi?: number;

  @IsNumber()
  @IsOptional()
  encargos?: number;
}

class BDIComponenteDto {
  @IsNumber()
  @IsOptional()
  percentual?: number;

  @IsBoolean()
  @IsOptional()
  habilitado?: boolean;
}

class BDIDetalhadoDto {
  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => BDIComponenteDto)
  administracao?: BDIComponenteDto;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => BDIComponenteDto)
  seguros?: BDIComponenteDto;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => BDIComponenteDto)
  garantias?: BDIComponenteDto;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => BDIComponenteDto)
  riscos?: BDIComponenteDto;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => BDIComponenteDto)
  lucro?: BDIComponenteDto;
}

class ConfiguracoesDetalhadasDto {
  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => BDIDetalhadoDto)
  bdi?: BDIDetalhadoDto;
}

class EncargosDto {
  @IsNumber()
  @IsOptional()
  percentual?: number;

  @IsNumber()
  @IsOptional()
  valor?: number;
}

class ItemComposicaoDto {
  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  @IsOptional()
  codigo?: string;

  @IsString()
  descricao: string;

  @IsNumber()
  quantidade: number;

  @IsString()
  unidade: string;

  @IsNumber()
  @IsOptional()
  peso?: number;

  @IsString()
  @IsOptional()
  material?: string;

  @IsString()
  @IsOptional()
  especificacao?: string;

  @IsNumber()
  valorUnitario: number;

  @IsEnum(['material', 'mao_obra', 'ferramenta', 'consumivel', 'outros'])
  @IsOptional()
  tipoItem?: string;

  @IsString()
  @IsOptional()
  tipoCalculo?: string;

  @IsString()
  @IsOptional()
  cargo?: string;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => EncargosDto)
  encargos?: EncargosDto;

  @IsEnum(['A', 'B', 'C'])
  @IsOptional()
  classeABC?: string;

  @IsNumber()
  @IsOptional()
  ordem?: number;
}

class BDIDto {
  @IsNumber()
  percentual: number;

  @IsNumber()
  @IsOptional()
  valor?: number;
}

class ComposicaoDto {
  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  @IsOptional()
  nome?: string;

  @IsEnum([
    'mobilizacao',
    'desmobilizacao',
    'mo_fabricacao',
    'mo_montagem',
    'mo_terceirizados',
    'jato_pintura',
    'ferramentas',
    'ferramentas_eletricas',
    'consumiveis',
    'materiais',
  ])
  @IsOptional()
  tipo?: string;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => BDIDto)
  bdi?: BDIDto;

  @IsNumber()
  @IsOptional()
  ordem?: number;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ItemComposicaoDto)
  itens?: ItemComposicaoDto[];
}

export class UpdateOrcamentoDto {
  @IsString()
  @IsOptional()
  nome?: string;

  @IsEnum(['servico', 'produto'])
  @IsOptional()
  tipo?: 'servico' | 'produto';

  @IsEnum(['rascunho', 'em_analise', 'aprovado', 'rejeitado'])
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  clienteNome?: string;

  @IsString()
  @IsOptional()
  clienteCnpj?: string;

  @IsString()
  @IsOptional()
  codigoProjeto?: string;

  @IsNumber()
  @IsOptional()
  areaTotalM2?: number;

  @IsNumber()
  @IsOptional()
  metrosLineares?: number;

  @IsNumber()
  @IsOptional()
  pesoTotalProjeto?: number;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => TributosDto)
  tributos?: TributosDto;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => ConfiguracoesDto)
  configuracoes?: ConfiguracoesDto;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => ConfiguracoesDetalhadasDto)
  configuracoesDetalhadas?: ConfiguracoesDetalhadasDto;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ComposicaoDto)
  composicoes?: ComposicaoDto[];
}
