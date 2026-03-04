import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsEnum,
  IsBoolean,
  IsEmail,
  Length,
  IsInt,
} from 'class-validator';
import { TipoFornecedor } from '../entities/fornecedor.entity';

export class CreateFornecedorDto {
  @IsString()
  @IsNotEmpty()
  @Length(14, 18)
  cnpj: string;

  @IsString()
  @IsNotEmpty()
  razaoSocial: string;

  @IsString()
  @IsOptional()
  nomeFantasia?: string;

  @IsEnum(TipoFornecedor)
  @IsNotEmpty()
  tipo: TipoFornecedor;

  @IsString()
  @IsOptional()
  inscricaoEstadual?: string;

  @IsString()
  @IsOptional()
  endereco?: string;

  @IsString()
  @IsOptional()
  cidade?: string;

  @IsString()
  @IsOptional()
  @Length(2, 2)
  uf?: string;

  @IsString()
  @IsOptional()
  cep?: string;

  @IsString()
  @IsOptional()
  telefone?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  contatoNome?: string;

  @IsString()
  @IsOptional()
  contatoTelefone?: string;

  @IsInt()
  @IsOptional()
  prazoEntregaDias?: number;

  @IsString()
  @IsOptional()
  condicaoPagamento?: string;

  @IsString()
  @IsOptional()
  observacoes?: string;

  @IsBoolean()
  @IsOptional()
  ativo?: boolean;
}
