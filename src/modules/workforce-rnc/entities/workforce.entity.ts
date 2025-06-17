import { NonConformity } from 'src/modules/non-conformity/entities/non-conformity.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';

@Entity('workforce')
export class Workforce {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => NonConformity, (nonConformity) => nonConformity.workforce, {
    onDelete: 'CASCADE',
  })
  nonConformity: NonConformity;

  @Column({ type: 'int' })
  colaboradorId: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  valueHour: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  hours: number;

  @CreateDateColumn()
  createdAt: Date;
}
