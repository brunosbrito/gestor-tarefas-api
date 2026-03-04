import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum TipoMobilizacao {
  MOBILIZACAO = 'mobilizacao',
  DESMOBILIZACAO = 'desmobilizacao',
}

export enum CategoriaMobilizacao {
  TRANSPORTE = 'transporte',
  MONTAGEM_CANTEIRO = 'montagem_canteiro',
  EQUIPAMENTOS = 'equipamentos',
  OUTROS = 'outros',
}

@Entity('mobilizacao')
export class Mobilizacao {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: TipoMobilizacao })
  tipo: TipoMobilizacao;

  @Column()
  codigo: string; // Ex: "MOB-TRANSP-01"

  @Column()
  descricao: string;

  @Column({ type: 'enum', enum: CategoriaMobilizacao })
  categoria: CategoriaMobilizacao;

  @Column({ default: 'un' })
  unidade: string; // 'un', 'vb', 'km', 'dia'

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  precoUnitario: number;

  @Column({ nullable: true })
  observacoes: string;

  @Column({ default: true })
  ativo: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
