import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Proposta } from './proposta.entity';

export enum TipoItemProposta {
  PRODUTO = 'produto',
  SERVICO = 'servico',
}

@Entity('itens_proposta')
export class ItemProposta {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  item: number; // Número sequencial (1, 2, 3...)

  @Column()
  nome: string;

  @Column({ type: 'enum', enum: TipoItemProposta })
  tipo: TipoItemProposta;

  @Column({ type: 'decimal', precision: 12, scale: 4 })
  quantidade: number;

  @Column({ nullable: true, length: 20 })
  unidade: string;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  valorUnitario: number;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  subtotal: number;

  @Column({ nullable: true })
  observacao: string;

  // Relacionamento
  @ManyToOne(() => Proposta, (proposta) => proposta.itens, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'proposta_id' })
  proposta: Proposta;

  @Column()
  proposta_id: string;
}
