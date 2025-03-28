import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  OneToMany,
} from 'typeorm';
import { Team } from 'src/modules/team/entities/team.entity';
import { Activity } from 'src/modules/activities/entities/activities.entity';
import { WorkedHours } from 'src/modules/worked-hours/entities/worked-hours.entity';

@Entity('collaborators')
export class Collaborator {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  role: string;

  @Column("numeric", { precision: 10, scale: 2, default: 0.00 })
  pricePerHour: number;
  

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
}
