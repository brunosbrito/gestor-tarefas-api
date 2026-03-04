import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum CategoriaCargo {
  FABRICACAO = 'fabricacao',
  MONTAGEM = 'montagem',
  AMBOS = 'ambos',
}

export enum GrauInsalubridade {
  NENHUM = 'nenhum',
  MINIMO = 'minimo',
  MEDIO = 'medio',
  MAXIMO = 'maximo',
}

export enum TipoContrato {
  MENSALISTA = 'mensalista',
  HORISTA = 'horista',
}

// Interface para custos diversos (armazenado como JSONB)
export interface CustosDiversos {
  alimentacao: {
    cafeManha: number;
    almoco: number;
    janta: number;
    cestaBasica: number;
  };
  transporte: number;
  uniforme: {
    itens: Array<{ descricao: string; quantidade: number; valorUnitario: number }>;
    periodoMeses: number;
  };
  despesasAdmissionais: {
    valorPorEvento: number;
    periodoMeses: number;
  };
  assistenciaMedica: number;
  epiEpc: {
    itens: Array<{ descricao: string; quantidade: number; valorUnitario: number }>;
    periodoMeses: number;
  };
  outros: number;
}

// Valores padrão para custos diversos
export const DEFAULT_CUSTOS: CustosDiversos = {
  alimentacao: { cafeManha: 0, almoco: 0, janta: 0, cestaBasica: 0 },
  transporte: 0,
  uniforme: { itens: [], periodoMeses: 12 },
  despesasAdmissionais: { valorPorEvento: 500, periodoMeses: 24 },
  assistenciaMedica: 0,
  epiEpc: { itens: [], periodoMeses: 12 },
  outros: 0,
};

@Entity('cargos')
export class Cargo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nome: string;

  @Column({ nullable: true })
  nivel: string; // Ex: "I", "II", "III", "Junior", "Pleno", "Sênior"

  // === CAMPOS PREENCHIDOS PELO USUÁRIO ===

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  salarioBase: number;

  @Column({ default: false })
  temPericulosidade: boolean;

  @Column({ type: 'enum', enum: GrauInsalubridade, default: GrauInsalubridade.NENHUM })
  grauInsalubridade: GrauInsalubridade;

  @Column({ type: 'jsonb', default: DEFAULT_CUSTOS })
  custos: CustosDiversos;

  @Column({ type: 'int', default: 220 })
  horasMes: number;

  @Column({ type: 'enum', enum: TipoContrato, default: TipoContrato.HORISTA })
  tipoContrato: TipoContrato;

  @Column({ type: 'enum', enum: CategoriaCargo, default: CategoriaCargo.FABRICACAO })
  categoria: CategoriaCargo;

  // === CAMPOS CALCULADOS AUTOMATICAMENTE ===

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  valorPericulosidade: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  valorInsalubridade: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalSalario: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  valorEncargos: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalCustosDiversos: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalCustosMO: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  custoHH: number;

  // Metadados
  @Column({ default: true })
  ativo: boolean;

  @Column({ nullable: true })
  observacoes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
