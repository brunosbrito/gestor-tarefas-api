import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Team } from 'src/modules/team/entities/team.entity';
import { Activity } from 'src/modules/activities/entities/activities.entity';
import { WorkedHours } from 'src/modules/worked-hours/entities/worked-hours.entity';
import { ValuePerPosition } from 'src/modules/valuePerPosition/entity/value-per-position.entity';

@Entity('collaborators')
export class Collaborator {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  role: string;

  @Column({ default: 'Produção' })
  sector: string;

  @Column({ default: true })
  status: boolean;

  @ManyToOne(() => Team, (team) => team.collaborators, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  team: Team;

  @ManyToMany(() => Activity, (activity) => activity.collaborators)
  activities: Activity[];

  @OneToMany(() => WorkedHours, (workedHours) => workedHours.colaborador)
  workedHours: WorkedHours[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => ValuePerPosition, (position) => position.collaborators)
  @JoinColumn({ name: 'position_id' })
  position: ValuePerPosition;
}
