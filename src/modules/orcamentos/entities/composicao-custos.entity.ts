import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Orcamento } from './orcamento.entity';
import { ItemComposicao } from './item-composicao.entity';

export type ComposicaoTipo =
  | 'mobilizacao'
  | 'desmobilizacao'
  | 'mo_fabricacao'
  | 'mo_montagem'
  | 'mo_terceirizados'
  | 'jato_pintura'
  | 'ferramentas'
  | 'ferramentas_eletricas'
  | 'consumiveis'
  | 'materiais';

export interface BDI {
  percentual: number;
  valor: number;
}

@Entity('composicoes_custos')
export class ComposicaoCustos {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nome: string;

  @Column({
    type: 'enum',
    enum: [
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
    ],
  })
  tipo: ComposicaoTipo;

  @Column({
    type: 'jsonb',
    default: { percentual: 0, valor: 0 },
  })
  bdi: BDI;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  custoDirecto: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 8, scale: 4, default: 0 })
  percentualDoTotal: number;

  @Column({ default: 0 })
  ordem: number;

  @ManyToOne(() => Orcamento, (orc) => orc.composicoes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'orcamento_id' })
  orcamento: Orcamento;

  @Column({ name: 'orcamento_id' })
  orcamentoId: string;

  @OneToMany(() => ItemComposicao, (item) => item.composicao, {
    cascade: true,
    eager: true,
  })
  itens: ItemComposicao[];
}
