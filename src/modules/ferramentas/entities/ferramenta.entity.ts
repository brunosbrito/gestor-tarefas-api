import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum TipoFerramenta {
  MANUAL = 'manual',
  ELETRICA = 'eletrica',
  PNEUMATICA = 'pneumatica',
  MEDICAO = 'medicao',
  SOLDAGEM = 'soldagem',
  CORTE = 'corte',
  ELEVACAO = 'elevacao',
}

@Entity('ferramentas')
export class Ferramenta {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  codigo: string;

  @Column()
  descricao: string;

  @Column({ type: 'enum', enum: TipoFerramenta })
  tipo: TipoFerramenta;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  valorAquisicao: number;

  @Column({ type: 'int', default: 24 })
  vidaUtilMeses: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  custoMensal: number; // Calculado: valorAquisicao / vidaUtilMeses

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  custoDiario: number; // Calculado: custoMensal / 22

  @Column({ nullable: true })
  fabricante: string;

  @Column({ nullable: true })
  modelo: string;

  @Column({ nullable: true })
  potencia: string; // Ex: "2000W", "5HP"

  @Column({ nullable: true })
  observacoes: string;

  @Column({ default: true })
  ativo: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
