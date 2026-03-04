import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum MaterialCategoria {
  // Perfis
  PERFIL_U = 'perfil_u',
  PERFIL_U_ENRIJECIDO = 'perfil_u_enrijecido',
  PERFIL_L = 'perfil_l',
  PERFIL_I = 'perfil_i',
  PERFIL_H = 'perfil_h',
  PERFIL_T = 'perfil_t',
  PERFIL_Z = 'perfil_z',
  PERFIL_CARTOLA = 'perfil_cartola',

  // Barras
  BARRA_CHATA = 'barra_chata',
  BARRA_REDONDA = 'barra_redonda',
  BARRA_QUADRADA = 'barra_quadrada',

  // Tubos
  TUBO_REDONDO = 'tubo_redondo',
  TUBO_QUADRADO = 'tubo_quadrado',
  TUBO_RETANGULAR = 'tubo_retangular',

  // Chapas
  CHAPA_FINA = 'chapa_fina',
  CHAPA_GROSSA = 'chapa_grossa',
  CHAPA_XADREZ = 'chapa_xadrez',

  // Telhas
  TELHA_TRAPEZOIDAL = 'telha_trapezoidal',
  TELHA_ONDULADA = 'telha_ondulada',

  // Parafusos
  PARAFUSO = 'parafuso',
  PORCA = 'porca',
  ARRUELA = 'arruela',
  CHUMBADOR = 'chumbador',
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
