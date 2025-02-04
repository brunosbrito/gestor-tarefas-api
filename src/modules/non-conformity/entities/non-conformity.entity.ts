import { Material } from 'src/modules/material/entities/material.entity';
import { RncImage } from 'src/modules/rnc-image/entities/rnc-image.entity';
import { ServiceOrder } from 'src/modules/service_order/entities/service_order.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { Project } from 'src/modules/work/entities/project.entity';
import { Workforce } from 'src/modules/workforce-rnc/entities/workforce.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';

@Entity('non_conformities')
export class NonConformity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'int', nullable: true })
  responsibleIdentification: number;

  @Column({ type: 'timestamp' })
  dateOccurrence: Date;

  @Column({ type: 'text', nullable: true })
  correctiveAction: string;

  @Column({ type: 'int', nullable: true })
  responsibleAction: number;

  @Column({ type: 'timestamp', nullable: true })
  dateConclusion: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => RncImage, (rncImage) => rncImage.nonConformity, {
    cascade: true,
  })
  images: RncImage[];

  @OneToMany(() => Workforce, (workforce) => workforce.nonConformity, {
    cascade: true,
  })
  workforce: Workforce[];

  @OneToMany(() => Material, (material) => material.nonConformity)
  materials: Material[];

  @ManyToOne(() => User, (user) => user.responsibleRNC)
  responsibleRNC: User;

  @ManyToOne(() => Project, (project) => project.nonConformities)
  project: Project;

  @ManyToOne(() => ServiceOrder, (serviceOrder) => serviceOrder.nonConformities)
  serviceOrder: ServiceOrder;
}
