import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum CategoriaConsumivel {
  DISCO_CORTE = 'disco_corte',
  DISCO_DESBASTE = 'disco_desbaste',
  ELETRODO = 'eletrodo',
  ARAME_MIG = 'arame_mig',
  GAS = 'gas',
  LIXA = 'lixa',
  ESCOVA = 'escova',
  EPI = 'epi',
  ABRASIVO = 'abrasivo',
  OUTROS = 'outros',
}

@Entity('consumiveis')
export class Consumivel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  codigo: string;

  @Column()
  descricao: string;

  @Column({ type: 'enum', enum: CategoriaConsumivel })
  categoria: CategoriaConsumivel;

  @Column({ length: 20 })
  unidade: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  precoUnitario: number;

  @Column({ nullable: true })
  fornecedor: string;

  @Column({ nullable: true })
  especificacao: string;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  rendimento: number; // Ex: metros de corte por disco

  @Column({ nullable: true })
  observacoes: string;

  @Column({ default: true })
  ativo: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
