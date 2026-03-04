import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('acoes_5s')
export class Acao5S {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  data: string;

  @Column()
  descricao: string;

  @Column({ length: 7 })
  mes: string; // Formato: "YYYY-MM"

  @Column()
  createdBy: number;

  @CreateDateColumn()
  createdAt: Date;
}
