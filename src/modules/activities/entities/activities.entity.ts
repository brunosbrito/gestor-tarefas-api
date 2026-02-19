import { ActivityHistory } from 'src/modules/activity-history/entities/activity-history.entity';
import { ActivityImage } from 'src/modules/activity-image/entities/activity-image.entity';
import { Collaborator } from 'src/modules/collaborator/entities/collaborator.entity';
import { MacroTask } from 'src/modules/macro-task/entities/macro-task.entity';
import { Process } from 'src/modules/processes/entities/process.entity';
import { ServiceOrder } from 'src/modules/service_order/entities/service_order.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { Project } from 'src/modules/work/entities/project.entity';
import { WorkedHours } from 'src/modules/worked-hours/entities/worked-hours.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('activities')
export class Activity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: ['Planejadas', 'Em execução', 'Concluídas', 'Paralizadas', 'Atrasadas'],
    default: 'Planejadas',
  })
  status: string;

  @Column({ type: 'text', nullable: true })
  observation: string;

  @ManyToOne(() => User, { nullable: false })
  createdBy: User;

  @Column({ type: 'text', nullable: true })
  imageUrl: string;

  @Column({ type: 'text', nullable: true })
  imageDescription: string;

  @Column({ type: 'text', nullable: true })
  fileUrl: string;

  @Column({ type: 'text', nullable: true })
  fileDescription: string;

  @Column({ type: 'float', nullable: true })
  timePerUnit: number;

  @Column({ type: 'int', nullable: true })
  quantity: number;

  @Column({ type: 'text', nullable: true })
  estimatedTime: string;

  @Column({ type: 'float', nullable: true })
  actualTime: number;

  @ManyToOne(() => Project, (project) => project.activities, {
    nullable: false,
  })
  project: Project;

  @ManyToOne(() => ServiceOrder, (serviceOrder) => serviceOrder.activities, {
    nullable: false,
  })
  serviceOrder: ServiceOrder;

  @ManyToMany(() => Collaborator, (collaborator) => collaborator.activities, {
    cascade: ['insert', 'update'], // Adiciona o cascade de inserção e atualização
  })
  @JoinTable({ name: 'activity_collaborator' })
  collaborators: Collaborator[];

  @OneToMany(
    () => ActivityHistory,
    (activityHistory: ActivityHistory) => activityHistory.activity,
    { cascade: true },
  )
  history: ActivityHistory[];

  @OneToMany(() => WorkedHours, (workedHours) => workedHours.atividade, {
    cascade: true,
  })
  workedHours: WorkedHours[];

  @OneToMany(() => ActivityImage, (activityImage) => activityImage.activity, {
    cascade: true,
  })
  images: ActivityImage[];

  @Column({ type: 'timestamp', nullable: true })
  plannedStartDate: Date; // Data prevista para início.

  @Column({ type: 'timestamp', nullable: true })
  startDate: Date; // Data e hora de início.

  @Column({ type: 'timestamp', nullable: true })
  endDate?: Date;

  @Column({ type: 'timestamp', nullable: true })
  pauseDate: Date; // Data e hora de pausa.

  @CreateDateColumn()
  createdAt: Date; // Data e hora de criação.

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'float', nullable: true })
  totalTime: number;

  @Column({ type: 'timestamp', nullable: true })
  originalStartDate: Date;

  @Column({ type: 'int', nullable: true })
  cod_sequencial: number;

  @Column({ type: 'int', default: 0 })
  completedQuantity: number;

  @ManyToOne(() => MacroTask, (macroTask) => macroTask.activities, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'macroTask' })
  macroTask: MacroTask;

  @ManyToOne(() => Process, (process) => process.activities, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'process' })
  process: Process;
}
