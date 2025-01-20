import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('effective')
export class Effective {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  username: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ default: 0 })
  shift: number;

  @Column({ type: 'varchar', length: 50 })
  role: string;

  @Column({ type: 'varchar' })
  project: string;

  @Column({ type: 'varchar' })
  typeRegister?: string;

  @Column({ type: 'varchar' })
  reason: string;

  @Column({ type: 'varchar' })
  sector: string;

  @Column({ type: 'varchar' })
  status: string;
}
