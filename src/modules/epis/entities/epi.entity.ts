import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('epis')
export class Epi {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  descricao: string;

  @Column({ nullable: true })
  nomeResumido: string;

  @Column({ default: 'un' })
  unidade: string; // 'un', 'par', 'cx', 'kg', 'rolo', 'kit'

  @Column({ nullable: true })
  ca: string; // Certificado de Aprovação

  @Column({ nullable: true })
  fabricante: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  valorReferencia: number;

  @Column({ default: true })
  ativo: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
