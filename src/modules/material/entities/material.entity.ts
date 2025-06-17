import { NonConformity } from 'src/modules/non-conformity/entities/non-conformity.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('materials')
export class Material {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  material: string;

  @Column('decimal')
  quantidade: number;

  @Column()
  unidade: string;

  @Column('decimal')
  preco: number;

  @Column('decimal')
  total: number;

  @ManyToOne(() => NonConformity, (rnc) => rnc.materials, {
    onDelete: 'CASCADE',
  })
  nonConformity: NonConformity;
}
