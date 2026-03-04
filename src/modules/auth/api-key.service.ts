import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { ApiKey } from './entities/api-key.entity';
import {
  CreateApiKeyDto,
  UpdateApiKeyDto,
  ApiKeyResponseDto,
  ApiKeyCreatedResponseDto,
} from './dto/api-key.dto';

@Injectable()
export class ApiKeyService {
  constructor(
    @InjectRepository(ApiKey)
    private readonly apiKeyRepository: Repository<ApiKey>,
  ) {}

  /**
   * Gera uma nova API Key
   * IMPORTANTE: A chave completa só é retornada uma vez, na criação
   */
  async create(dto: CreateApiKeyDto, userId: number): Promise<ApiKeyCreatedResponseDto> {
    // Gerar chave única
    const rawKey = this.generateApiKey();
    const prefix = rawKey.substring(0, 12);
    const keyHash = this.hashApiKey(rawKey);

    // Verificar se prefixo já existe (improvável, mas seguro)
    const existing = await this.apiKeyRepository.findOne({ where: { prefix } });
    if (existing) {
      throw new ConflictException('Erro ao gerar chave, tente novamente');
    }

    const apiKey = this.apiKeyRepository.create({
      key: keyHash,
      prefix,
      name: dto.name,
      description: dto.description,
      permissions: dto.permissions || ['*'], // Todas as permissões por padrão
      allowedIps: dto.allowedIps || [],
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
      created_by: userId,
    });

    const saved = await this.apiKeyRepository.save(apiKey);

    return {
      id: saved.id,
      key: rawKey, // Retornado apenas na criação!
      prefix: saved.prefix,
      name: saved.name,
      description: saved.description,
      permissions: saved.permissions || [],
      allowedIps: saved.allowedIps || [],
      isActive: saved.isActive,
      expiresAt: saved.expiresAt,
      lastUsedAt: saved.lastUsedAt,
      usageCount: saved.usageCount,
      createdAt: saved.createdAt,
    };
  }

  /**
   * Lista todas as API Keys do usuário
   */
  async findAll(userId: number): Promise<ApiKeyResponseDto[]> {
    const keys = await this.apiKeyRepository.find({
      where: { created_by: userId },
      order: { createdAt: 'DESC' },
    });

    return keys.map((k) => this.toResponseDto(k));
  }

  /**
   * Busca uma API Key por ID
   */
  async findOne(id: string, userId: number): Promise<ApiKeyResponseDto> {
    const key = await this.apiKeyRepository.findOne({
      where: { id, created_by: userId },
    });

    if (!key) {
      throw new NotFoundException('API Key não encontrada');
    }

    return this.toResponseDto(key);
  }

  /**
   * Atualiza uma API Key
   */
  async update(id: string, dto: UpdateApiKeyDto, userId: number): Promise<ApiKeyResponseDto> {
    const key = await this.apiKeyRepository.findOne({
      where: { id, created_by: userId },
    });

    if (!key) {
      throw new NotFoundException('API Key não encontrada');
    }

    // Atualizar campos
    if (dto.name !== undefined) key.name = dto.name;
    if (dto.description !== undefined) key.description = dto.description;
    if (dto.permissions !== undefined) key.permissions = dto.permissions;
    if (dto.allowedIps !== undefined) key.allowedIps = dto.allowedIps;
    if (dto.isActive !== undefined) key.isActive = dto.isActive;
    if (dto.expiresAt !== undefined) {
      key.expiresAt = dto.expiresAt ? new Date(dto.expiresAt) : null;
    }

    const saved = await this.apiKeyRepository.save(key);
    return this.toResponseDto(saved);
  }

  /**
   * Revoga (desativa) uma API Key
   */
  async revoke(id: string, userId: number): Promise<void> {
    const key = await this.apiKeyRepository.findOne({
      where: { id, created_by: userId },
    });

    if (!key) {
      throw new NotFoundException('API Key não encontrada');
    }

    key.isActive = false;
    await this.apiKeyRepository.save(key);
  }

  /**
   * Remove permanentemente uma API Key
   */
  async remove(id: string, userId: number): Promise<void> {
    const key = await this.apiKeyRepository.findOne({
      where: { id, created_by: userId },
    });

    if (!key) {
      throw new NotFoundException('API Key não encontrada');
    }

    await this.apiKeyRepository.remove(key);
  }

  /**
   * Regenera uma API Key (cria nova chave, mantém configurações)
   */
  async regenerate(id: string, userId: number): Promise<ApiKeyCreatedResponseDto> {
    const key = await this.apiKeyRepository.findOne({
      where: { id, created_by: userId },
    });

    if (!key) {
      throw new NotFoundException('API Key não encontrada');
    }

    // Gerar nova chave
    const rawKey = this.generateApiKey();
    const prefix = rawKey.substring(0, 12);
    const keyHash = this.hashApiKey(rawKey);

    key.key = keyHash;
    key.prefix = prefix;
    key.lastUsedAt = null;
    key.usageCount = 0;

    const saved = await this.apiKeyRepository.save(key);

    return {
      id: saved.id,
      key: rawKey,
      prefix: saved.prefix,
      name: saved.name,
      description: saved.description,
      permissions: saved.permissions || [],
      allowedIps: saved.allowedIps || [],
      isActive: saved.isActive,
      expiresAt: saved.expiresAt,
      lastUsedAt: saved.lastUsedAt,
      usageCount: saved.usageCount,
      createdAt: saved.createdAt,
    };
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  private generateApiKey(): string {
    const prefix = 'sk_live_';
    const randomPart = crypto.randomBytes(32).toString('base64url');
    return prefix + randomPart;
  }

  private hashApiKey(key: string): string {
    return crypto.createHash('sha256').update(key).digest('hex');
  }

  private toResponseDto(key: ApiKey): ApiKeyResponseDto {
    return {
      id: key.id,
      prefix: key.prefix,
      name: key.name,
      description: key.description,
      permissions: key.permissions || [],
      allowedIps: key.allowedIps || [],
      isActive: key.isActive,
      expiresAt: key.expiresAt,
      lastUsedAt: key.lastUsedAt,
      usageCount: key.usageCount,
      createdAt: key.createdAt,
    };
  }
}
