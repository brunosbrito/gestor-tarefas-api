import { ActivityHistory } from 'src/modules/activity-history/entities/activity-history.entity';
import { NonConformity } from 'src/modules/non-conformity/entities/non-conformity.entity';
import { ServiceOrder } from 'src/modules/service_order/entities/service_order.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 'admin' })
  role: string;

  @OneToMany(
    () => NonConformity,
    (nonConformity) => nonConformity.responsibleRNC,
  )
  responsibleRNC: NonConformity[];

  @OneToMany(() => ServiceOrder, (serviceOrder) => serviceOrder.assignedUser)
  assignedOrders: ServiceOrder[];

  @OneToMany(
    () => ActivityHistory,
    (activityHistory) => activityHistory.changedBy,
  )
  activityHistories: ActivityHistory[];
}
