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

  @Column({ type: 'varchar', length: 255 })
  workerName: string;

  @Column({ type: 'varchar', length: 255 })
  role: string;

  @Column({ type: 'int', default: 0 })
  hoursWorked: number;

  @CreateDateColumn()
  createdAt: Date;
}
