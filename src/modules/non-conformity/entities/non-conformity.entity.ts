import { Collaborator } from 'src/modules/collaborator/entities/collaborator.entity';
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
  JoinColumn,
} from 'typeorm';

@Entity('non_conformities')
export class NonConformity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  description: string;

  @ManyToOne(() => Collaborator, { nullable: true, eager: true })
  @JoinColumn({ name: 'responsibleIdentification' })
  responsibleIdentification: Collaborator;

  @Column({ type: 'timestamp' })
  dateOccurrence: Date;

  @Column({ type: 'text', nullable: true })
  correctiveAction: string;

 @ManyToOne(() => Collaborator, { nullable: true, eager: true })
@JoinColumn({ name: 'responsibleAction' })
responsibleAction: Collaborator;

  @Column({ type: 'timestamp', nullable: true })
  dateConclusion: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => RncImage, (rncImage) => rncImage.nonConformityId, {
    cascade: true,
  })
  images: RncImage[];

  @OneToMany(() => Workforce, (workforce) => workforce.nonConformity, {
    cascade: true,
  })
  workforce: Workforce[];

  @OneToMany(() => Material, (material) => material.nonConformity)
  materials: Material[];

  @ManyToOne(() => Collaborator, { nullable: true, eager: true })
  @JoinColumn({ name: 'responsibleRNC' })
  responsibleRNC: Collaborator;

  @ManyToOne(() => Project, (project) => project.nonConformities)
  project: Project;

  @ManyToOne(() => ServiceOrder, (serviceOrder) => serviceOrder.nonConformities)
  serviceOrder: ServiceOrder;
}
