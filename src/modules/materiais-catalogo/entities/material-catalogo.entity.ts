import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum MaterialCategoria {
  // Perfis Estruturais
  PERFIL_I = 'perfil_i',
  PERFIL_U = 'perfil_u',
  CANTONEIRA = 'cantoneira',
  PERFIL_W = 'perfil_w',
  PERFIL_HP = 'perfil_hp',

  // Barras
  BARRA_REDONDA = 'barra_redonda',
  BARRA_CHATA = 'barra_chata',
  BARRA_QUADRADA = 'barra_quadrada',

  // Tubos
  TUBO_QUADRADO = 'tubo_quadrado',
  TUBO_RETANGULAR = 'tubo_retangular',
  TUBO_REDONDO = 'tubo_redondo',

  // Chapas
  CHAPA = 'chapa',

  // Telhas
  TELHA_TRAPEZOIDAL = 'telha_trapezoidal',
  TELHA_ONDULADA = 'telha_ondulada',
  TELHA_MULTIONDA = 'telha_multionda',

  // Parafusos
  PARAFUSO_A307 = 'parafuso_a307',
  PARAFUSO_A325 = 'parafuso_a325',
  PARAFUSO_A489 = 'parafuso_a489',

  // Outros
  OUTRO = 'outro',
}

@Entity('materiais_catalogo')
export class MaterialCatalogo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  codigo: string;

  @Column()
  descricao: string;

  @Column({ type: 'enum', enum: MaterialCategoria })
  categoria: MaterialCategoria;

  @Column()
  fornecedor: string;

  @Column({ length: 20 })
  unidade: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  precoUnitario: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  precoKg: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  pesoNominal: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  perimetroM: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  areaM2PorMetroLinear: number;

  @Column({ nullable: true })
  tipoMaterialPintura: string;

  @Column({ type: 'text', nullable: true })
  especificacao: string;

  @Column({ nullable: true })
  observacoes: string;

  @Column({ default: true })
  ativo: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
