import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { NonConformity } from 'src/modules/non-conformity/entities/non-conformity.entity';

@Entity('rnc_images')
export class RncImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  imageUrl: string;

  @ManyToOne(() => NonConformity)
  @JoinColumn({ name: 'nonConformityId' })
  nonConformityId: NonConformity;
}
