import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum TemplateCategoriaEnum {
  GALPAO_INDUSTRIAL = 'galpao_industrial',
  COBERTURA_METALICA = 'cobertura_metalica',
  MEZANINO = 'mezanino',
  ESCADA_PLATAFORMA = 'escada_plataforma',
  ESTRUTURA_APOIO = 'estrutura_apoio',
  REFORMA = 'reforma',
  OUTROS = 'outros',
}

export interface ItemTemplateData {
  codigo: string;
  descricao: string;
  quantidade: number;
  unidade: string;
  valorUnitario: number;
  tipoItem: string;
  material?: string;
  especificacao?: string;
  peso?: number;
  cargo?: string;
  tipoCalculo?: string;
  encargos?: { percentual: number; valor: number };
  ordem: number;
}

export interface ComposicaoTemplateData {
  tipo: string;
  descricao: string;
  bdiPercentual: number;
  enabled: boolean;
  ordem: number;
  itens?: ItemTemplateData[];
}

export interface TemplateConfiguracoes {
  bdi: number;
  lucro: number;
  tributos: {
    iss: number;
    simples: number;
    total: number;
  };
  encargos: number;
}

@Entity('orcamento_templates')
export class OrcamentoTemplate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nome: string;

  @Column({ type: 'text', nullable: true })
  descricao: string;

  @Column({
    type: 'enum',
    enum: TemplateCategoriaEnum,
    default: TemplateCategoriaEnum.OUTROS,
  })
  categoria: TemplateCategoriaEnum;

  @Column({
    type: 'jsonb',
    default: {
      bdi: 0.25,
      lucro: 0.20,
      tributos: { iss: 0.03, simples: 0.118, total: 0.148 },
      encargos: 0.58724,
    },
  })
  configuracoes: TemplateConfiguracoes;

  @Column({ type: 'jsonb', default: [] })
  composicoesTemplate: ComposicaoTemplateData[];

  @Column({ default: true })
  ativo: boolean;

  @Column({ nullable: true })
  createdBy: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
