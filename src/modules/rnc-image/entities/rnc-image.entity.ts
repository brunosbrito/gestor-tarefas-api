import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { NonConformity } from 'src/modules/non-conformity/entities/non-conformity.entity';
import { text } from 'stream/consumers';

@Entity('rnc_images')
export class RncImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  url: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToOne(() => NonConformity)
  @JoinColumn({ name: 'nonConformityId' })
  nonConformityId: NonConformity;
}
