import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum TipoFornecedor {
  MATERIAL = 'material',
  SERVICO = 'servico',
  EQUIPAMENTO = 'equipamento',
  CONSUMIVEL = 'consumivel',
  TINTA = 'tinta',
  LOCACAO = 'locacao',
}

@Entity('fornecedores')
export class Fornecedor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  cnpj: string;

  @Column()
  razaoSocial: string;

  @Column({ nullable: true })
  nomeFantasia: string;

  @Column({ type: 'enum', enum: TipoFornecedor })
  tipo: TipoFornecedor;

  @Column({ nullable: true })
  inscricaoEstadual: string;

  @Column({ nullable: true })
  endereco: string;

  @Column({ nullable: true })
  cidade: string;

  @Column({ nullable: true, length: 2 })
  uf: string;

  @Column({ nullable: true, length: 9 })
  cep: string;

  @Column({ nullable: true })
  telefone: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  contatoNome: string;

  @Column({ nullable: true })
  contatoTelefone: string;

  @Column({ type: 'int', default: 30 })
  prazoEntregaDias: number;

  @Column({ nullable: true })
  condicaoPagamento: string; // Ex: "30/60/90 dias"

  @Column({ type: 'text', nullable: true })
  observacoes: string;

  @Column({ default: true })
  ativo: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
