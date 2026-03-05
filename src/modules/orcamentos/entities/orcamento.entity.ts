import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ComposicaoCustos } from './composicao-custos.entity';

export type OrcamentoTipo = 'servico' | 'produto';
export type OrcamentoStatus = 'rascunho' | 'em_analise' | 'aprovado' | 'rejeitado';

export interface Tributos {
  temISS: boolean;
  aliquotaISS: number;
  aliquotaSimples: number;
}

export interface Configuracoes {
  bdi: number;
  lucro: number;
  encargos: number;
}

export interface ConfiguracoesDetalhadas {
  bdi?: {
    administracao?: { percentual: number; habilitado: boolean };
    seguros?: { percentual: number; habilitado: boolean };
    garantias?: { percentual: number; habilitado: boolean };
    riscos?: { percentual: number; habilitado: boolean };
  };
  lucro?: { percentual: number; habilitado: boolean };
}

export interface QQPSuprimentos {
  materiais: number;
  pintura: number;
  ferramentas: number;
  consumiveis: number;
  total: number;
}

export interface QQPCliente {
  suprimentos: number;
  maoObra: number;
  bdi: number;
  subtotal: number;
  tributos: number;
  total: number;
  area?: number;
  precoM2?: number;
}

export interface DRE {
  receitaLiquida: number;
  lucroBruto: number;
  margemBruta: number;
  lucroLiquido: number;
  margemLiquida: number;
}

@Entity('orcamentos')
export class Orcamento {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  numero: string;

  @Column()
  nome: string;

  @Column({
    type: 'enum',
    enum: ['servico', 'produto'],
  })
  tipo: OrcamentoTipo;

  @Column({
    type: 'enum',
    enum: ['rascunho', 'em_analise', 'aprovado', 'rejeitado'],
    default: 'rascunho',
  })
  status: OrcamentoStatus;

  @Column({ nullable: true })
  clienteNome: string;

  @Column({ nullable: true })
  clienteCnpj: string;

  @Column({ nullable: true })
  codigoProjeto: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  areaTotalM2: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  metrosLineares: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  pesoTotalProjeto: number;

  @Column({
    type: 'jsonb',
    default: { temISS: false, aliquotaISS: 0, aliquotaSimples: 11.8 },
  })
  tributos: Tributos;

  @Column({
    type: 'jsonb',
    default: { bdi: 0, lucro: 0, encargos: 58.724 },
  })
  configuracoes: Configuracoes;

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  configuracoesDetalhadas: ConfiguracoesDetalhadas;

  @Column({
    type: 'jsonb',
    default: { materiais: 0, pintura: 0, ferramentas: 0, consumiveis: 0, total: 0 },
  })
  qqpSuprimentos: QQPSuprimentos;

  @Column({
    type: 'jsonb',
    default: { suprimentos: 0, maoObra: 0, bdi: 0, subtotal: 0, tributos: 0, total: 0 },
  })
  qqpCliente: QQPCliente;

  // Campos calculados
  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  custoDirectoTotal: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  bdiTotal: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  lucroTotal: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  precoBase: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  tributosTotal: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  totalVenda: number;

  @Column({ type: 'decimal', precision: 8, scale: 4, default: 0 })
  bdiMedio: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  custoPorM2: number;

  @Column({
    type: 'jsonb',
    default: {
      receitaLiquida: 0,
      lucroBruto: 0,
      margemBruta: 0,
      lucroLiquido: 0,
      margemLiquida: 0,
    },
  })
  dre: DRE;

  @Column()
  createdBy: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relacionamentos
  @OneToMany(() => ComposicaoCustos, (comp) => comp.orcamento, {
    cascade: true,
    eager: true,
  })
  composicoes: ComposicaoCustos[];
}
