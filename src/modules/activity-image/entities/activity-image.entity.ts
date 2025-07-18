import { Activity } from 'src/modules/activities/entities/activities.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

@Entity()
export class ActivityImage {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Activity, (activity) => activity.images, {
    onDelete: 'CASCADE',
  })
  activity: Activity;

  @Column()
  imageName: string;

  @Column('varchar') // Usando bytea para armazenar imagens binárias
  imagePath: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column()
  description: string;

  @ManyToOne(() => User, (user) => user.activityHistories)
  createdBy: User;
}
