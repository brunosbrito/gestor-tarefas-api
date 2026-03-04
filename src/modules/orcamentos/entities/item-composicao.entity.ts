import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ComposicaoCustos } from './composicao-custos.entity';

export type TipoItem = 'material' | 'mao_obra' | 'ferramenta' | 'consumivel' | 'outros';
export type ClasseABC = 'A' | 'B' | 'C';

export interface Encargos {
  percentual: number;
  valor: number;
}

@Entity('itens_composicao')
export class ItemComposicao {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  codigo: string;

  @Column()
  descricao: string;

  @Column({ type: 'decimal', precision: 12, scale: 4 })
  quantidade: number;

  @Column({ length: 20 })
  unidade: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  peso: number;

  @Column({ nullable: true })
  material: string;

  @Column({ nullable: true })
  especificacao: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  valorUnitario: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 8, scale: 4, default: 0 })
  percentual: number;

  @Column({
    type: 'enum',
    enum: ['material', 'mao_obra', 'ferramenta', 'consumivel', 'outros'],
    default: 'outros',
  })
  tipoItem: TipoItem;

  @Column({ nullable: true })
  tipoCalculo: string;

  @Column({ nullable: true })
  cargo: string;

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  encargos: Encargos;

  @Column({
    type: 'enum',
    enum: ['A', 'B', 'C'],
    nullable: true,
  })
  classeABC: ClasseABC;

  @Column({ default: 0 })
  ordem: number;

  @ManyToOne(() => ComposicaoCustos, (comp) => comp.itens, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'composicao_id' })
  composicao: ComposicaoCustos;

  @Column({ name: 'composicao_id' })
  composicaoId: string;
}
