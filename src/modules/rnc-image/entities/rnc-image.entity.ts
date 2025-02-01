import { NonConformity } from 'src/modules/non-conformity/entities/non-conformity.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';

@Entity('rnc_images')
export class RncImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => NonConformity, (nonConformity) => nonConformity.images, {
    onDelete: 'CASCADE',
  })
  nonConformity: NonConformity;

  @Column({ type: 'text' })
  imageUrl: string;

  @CreateDateColumn()
  createdAt: Date;
}
