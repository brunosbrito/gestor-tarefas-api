import { Activity } from 'src/modules/activities/entities/activities.entity';
import { NonConformity } from 'src/modules/non-conformity/entities/non-conformity.entity';
import { ServiceOrder } from 'src/modules/service_order/entities/service_order.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity('project')
export class Project {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  groupNumber: string;

  @Column({ type: 'varchar', length: 255 })
  client: string;

  @Column({ type: 'varchar', length: 255 })
  address: string;

  @Column({ type: 'date' })
  startDate: string;

  @Column({ type: 'date', nullable: true })
  endDate: string | null;

  @Column({ type: 'text', nullable: true })
  observation: string | null;

  @Column({ type: 'text', nullable: true })
  status: string | null;

  @OneToMany(() => ServiceOrder, (serviceOrder) => serviceOrder.projectId, {
    cascade: true,
  })
  serviceOrders: ServiceOrder[];

  @OneToMany(() => Activity, (activity) => activity.project)
  activities: Activity[];

  @OneToMany(() => NonConformity, (nonConformity) => nonConformity.project)
  nonConformities: NonConformity[];

  @Column({
    type: 'enum',
    enum: ['Fabrica', 'Obra', 'Mineradora'],
    default: 'Fabrica',
  })
  type: string;
}
