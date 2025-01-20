import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from 'src/modules/user/entities/user.entity'; // Supondo que existe uma entidade User
import { Activity } from 'src/modules/activities/entities/activities.entity';

@Entity('activity_histories')
export class ActivityHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Activity, (activity) => activity.history)
  activity: Activity;

  @Column()
  status: string;

  @Column()
  description: string;

  @ManyToOne(() => User, (user) => user.activityHistories)
  changedBy: User;

  @CreateDateColumn()
  timestamp: Date;
}
