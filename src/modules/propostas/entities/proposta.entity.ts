import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ItemProposta } from './item-proposta.entity';

export enum StatusProposta {
  RASCUNHO = 'rascunho',
  EM_ANALISE = 'em_analise',
  APROVADA = 'aprovada',
  REJEITADA = 'rejeitada',
  CANCELADA = 'cancelada',
}

export enum MoedaProposta {
  BRL = 'BRL',
  USD = 'USD',
}

@Entity('propostas')
export class Proposta {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  numero: string;

  @Column()
  titulo: string;

  // Dados do Cliente (JSON)
  @Column({ type: 'jsonb' })
  cliente: {
    razaoSocial: string;
    nomeFantasia?: string;
    cnpj: string;
    endereco: string;
    bairro?: string;
    cep: string;
    cidade: string;
    uf: string;
    telefone: string;
    email: string;
    contatoAtencao?: string;
  };

  // Vendedor (JSON)
  @Column({ type: 'jsonb' })
  vendedor: {
    nome: string;
    telefone?: string;
    email?: string;
  };

  // Datas
  @Column({ type: 'date' })
  dataEmissao: string;

  @Column({ type: 'date' })
  dataValidade: string;

  @Column()
  previsaoEntrega: string;

  // Vinculação com Orçamento
  @Column({ nullable: true })
  orcamentoId: string;

  // Valores
  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  subtotalItens: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  valorTotal: number;

  @Column({ type: 'enum', enum: MoedaProposta, default: MoedaProposta.BRL })
  moeda: MoedaProposta;

  // Pagamento (JSON)
  @Column({ type: 'jsonb' })
  pagamento: {
    vencimento?: string;
    valor: number;
    formaPagamento: string;
    observacao?: string;
  };

  // Observações (JSON)
  @Column({ type: 'jsonb', default: {} })
  observacoes: {
    impostosInclusos: boolean;
    faturamentoMateriais?: string;
    faturamentoServicos?: string;
    beneficiosIsencoes?: string;
    condicoesPagamentoMateriais?: string;
    condicoesPagamentoServicos?: string;
    prazoEntregaDetalhado?: string;
    transporteEquipamento: 'cliente' | 'gmx';
    hospedagemAlimentacao: 'cliente' | 'gmx';
    condicoesGerais: Array<{
      codigo: string;
      descricao: string;
      ativo: boolean;
      ordem: number;
    }>;
    itensForaEscopo: string[];
  };

  // Status
  @Column({ type: 'enum', enum: StatusProposta, default: StatusProposta.RASCUNHO })
  status: StatusProposta;

  @Column({ nullable: true })
  motivoRejeicao: string;

  // Integração com Obra
  @Column({ nullable: true })
  obraId: number;

  // Metadata
  @Column()
  createdBy: number;

  @Column({ nullable: true })
  aprovadoPor: number;

  @Column({ type: 'timestamp', nullable: true })
  dataAprovacao: Date;

  @Column({ type: 'timestamp', nullable: true })
  dataRejeicao: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relacionamentos
  @OneToMany(() => ItemProposta, (item) => item.proposta, { cascade: true, eager: true })
  itens: ItemProposta[];
}
