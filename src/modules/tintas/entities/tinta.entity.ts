import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum TipoTinta {
  PRIMER = 'primer',
  ACABAMENTO = 'acabamento',
  SOLVENTE = 'solvente',
}

@Entity('tintas')
export class Tinta {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  codigo: string;

  @Column()
  descricao: string;

  @Column({ type: 'enum', enum: TipoTinta })
  tipo: TipoTinta;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  solidosVolume: number; // % (SV)

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  precoLitro: number;

  @Column()
  fornecedor: string;

  @Column({ nullable: true })
  observacoes: string;

  @Column({ default: true })
  ativo: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
