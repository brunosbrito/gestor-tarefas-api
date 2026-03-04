import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type CategoriaInsumo =
  | 'material'
  | 'consumivel'
  | 'tinta'
  | 'mao_obra'
  | 'ferramenta'
  | 'equipamento'
  | 'servico';

@Entity('insumos')
export class Insumo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  codigo: string;

  @Column()
  descricao: string;

  @Column({
    type: 'enum',
    enum: ['material', 'consumivel', 'tinta', 'mao_obra', 'ferramenta', 'equipamento', 'servico'],
  })
  categoria: CategoriaInsumo;

  @Column({ length: 20 })
  unidade: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  valorUnitario: number;

  // Campos específicos para materiais
  @Column({ nullable: true })
  material: string; // Ex: "ASTM A36", "ASTM A572-50", "AISI 304"

  @Column({ nullable: true })
  especificacao: string; // Ex: "Perfil W 200x35,9", "Chapa 6,35mm"

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  pesoUnitario: number; // kg por unidade (para materiais)

  // Campos específicos para mão de obra
  @Column({ nullable: true })
  cargo: string; // Ex: "Soldador", "Montador", "Auxiliar"

  @Column({ type: 'decimal', precision: 6, scale: 4, nullable: true })
  encargosPercentual: number; // % de encargos trabalhistas

  // Campos específicos para tintas
  @Column({ nullable: true })
  fabricante: string;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  rendimento: number; // m²/litro ou kg/m²

  // Campos de controle
  @Column({ default: true })
  ativo: boolean;

  @Column({ nullable: true })
  observacao: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
