import { Activity } from 'src/modules/activities/entities/activities.entity';
import { Collaborator } from 'src/modules/collaborator/entities/collaborator.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

@Entity('Worked_hours')
export class WorkedHours {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Activity, (activity) => activity.workedHours)
  atividade: Activity;

  @ManyToOne(() => Collaborator, (collaborator) => collaborator.workedHours)
  colaborador: Collaborator;

  @Column()
  hoursWorked: number;

  @Column()
  date: string;
}
