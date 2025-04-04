import { Activity } from 'src/modules/activities/entities/activities.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';

@Entity('macro_task')
export class MacroTask {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Activity, (activity) => activity.macroTask)
  activities: Activity[];
}
