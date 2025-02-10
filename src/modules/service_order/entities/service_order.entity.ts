import { Activity } from 'src/modules/activities/entities/activities.entity';
import { NonConformity } from 'src/modules/non-conformity/entities/non-conformity.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { Project } from 'src/modules/work/entities/project.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

@Entity('service_orders')
export class ServiceOrder {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  serviceOrderNumber: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: 'Em andamento' })
  status: string;

  @ManyToOne(() => Project, (project) => project.serviceOrders, {
    nullable: false,
  })
  projectId: Project;

  @ManyToOne(() => User, (user) => user.assignedOrders, { nullable: true })
  assignedUser: User;

  @OneToMany(() => Activity, (activity) => activity.serviceOrder)
  activities: Activity[];

  @OneToMany(() => NonConformity, (nonConformity) => nonConformity.serviceOrder)
  nonConformities: NonConformity[];

  @Column({ type: 'timestamp', nullable: true })
  startDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  dueDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ type: 'text', nullable: true })
  notes: string; // Notas adicionais.

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'int', nullable: true })
  quantity: number;

  @Column({ type: 'text', nullable: true })
  projectNumber: string;

  @Column({ type: 'text', nullable: true })
  weight: string;

  @Column({ type: 'int', default: 0 })
  progress: number;
}
