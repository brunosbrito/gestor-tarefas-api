import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity('api_keys')
export class ApiKey {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  key: string; // Hash da chave (nunca armazenar em texto puro)

  @Column({ unique: true })
  prefix: string; // Prefixo visível (ex: "sk_live_abc...")

  @Column()
  name: string; // Nome descritivo (ex: "Integração ERP")

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'simple-array', nullable: true })
  permissions: string[]; // ['read:orcamentos', 'write:orcamentos', etc.]

  @Column({ type: 'simple-array', nullable: true })
  allowedIps: string[]; // IPs permitidos (null = todos)

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date | null; // null = nunca expira

  @Column({ type: 'timestamp', nullable: true })
  lastUsedAt: Date | null;

  @Column({ default: 0 })
  usageCount: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @Column()
  created_by: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
