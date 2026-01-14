import { Collaborator } from 'src/modules/collaborator/entities/collaborator.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

@Entity('value_per_position')
export class ValuePerPosition {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  position: string;

  @Column('decimal', { precision: 10, scale: 2 })
  value: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Collaborator, (collaborator) => collaborator.position)
  collaborators: Collaborator[];
}
