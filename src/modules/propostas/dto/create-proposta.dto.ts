import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEnum, IsArray, ValidateNested, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { MoedaProposta } from '../entities/proposta.entity';

class ClienteDto {
  @IsString()
  @IsNotEmpty()
  razaoSocial: string;

  @IsString()
  @IsOptional()
  nomeFantasia?: string;

  @IsString()
  @IsNotEmpty()
  cnpj: string;

  @IsString()
  @IsNotEmpty()
  endereco: string;

  @IsString()
  @IsOptional()
  bairro?: string;

  @IsString()
  @IsNotEmpty()
  cep: string;

  @IsString()
  @IsNotEmpty()
  cidade: string;

  @IsString()
  @IsNotEmpty()
  uf: string;

  @IsString()
  @IsNotEmpty()
  telefone: string;

  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsOptional()
  contatoAtencao?: string;
}

class VendedorDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsString()
  @IsOptional()
  telefone?: string;

  @IsString()
  @IsOptional()
  email?: string;
}

class PagamentoDto {
  @IsString()
  @IsOptional()
  vencimento?: string;

  @IsNumber()
  valor: number;

  @IsString()
  @IsNotEmpty()
  formaPagamento: string;

  @IsString()
  @IsOptional()
  observacao?: string;
}

class CondicaoGeralDto {
  @IsString()
  codigo: string;

  @IsString()
  descricao: string;

  @IsBoolean()
  ativo: boolean;

  @IsNumber()
  ordem: number;
}

class ObservacoesDto {
  @IsBoolean()
  impostosInclusos: boolean;

  @IsString()
  @IsOptional()
  faturamentoMateriais?: string;

  @IsString()
  @IsOptional()
  faturamentoServicos?: string;

  @IsString()
  @IsOptional()
  beneficiosIsencoes?: string;

  @IsString()
  @IsOptional()
  condicoesPagamentoMateriais?: string;

  @IsString()
  @IsOptional()
  condicoesPagamentoServicos?: string;

  @IsString()
  @IsOptional()
  prazoEntregaDetalhado?: string;

  @IsString()
  transporteEquipamento: 'cliente' | 'gmx';

  @IsString()
  hospedagemAlimentacao: 'cliente' | 'gmx';

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CondicaoGeralDto)
  @IsOptional()
  condicoesGerais?: CondicaoGeralDto[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  itensForaEscopo?: string[];
}

class CreateItemPropostaDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsString()
  @IsNotEmpty()
  tipo: 'produto' | 'servico';

  @IsNumber()
  quantidade: number;

  @IsString()
  @IsOptional()
  unidade?: string;

  @IsNumber()
  valorUnitario: number;

  @IsString()
  @IsOptional()
  observacao?: string;
}

export class CreatePropostaDto {
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @ValidateNested()
  @Type(() => ClienteDto)
  cliente: ClienteDto;

  @ValidateNested()
  @Type(() => VendedorDto)
  vendedor: VendedorDto;

  @IsString()
  @IsNotEmpty()
  dataValidade: string;

  @IsString()
  @IsNotEmpty()
  previsaoEntrega: string;

  @IsString()
  @IsOptional()
  orcamentoId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateItemPropostaDto)
  @IsOptional()
  itens?: CreateItemPropostaDto[];

  @IsNumber()
  valorTotal: number;

  @IsEnum(MoedaProposta)
  @IsOptional()
  moeda?: MoedaProposta;

  @ValidateNested()
  @Type(() => PagamentoDto)
  pagamento: PagamentoDto;

  @ValidateNested()
  @Type(() => ObservacoesDto)
  observacoes: ObservacoesDto;
}
