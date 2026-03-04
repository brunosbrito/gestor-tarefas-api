import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { ApiKey } from './entities/api-key.entity';

export const ALLOW_API_KEY = 'allowApiKey';
export const REQUIRED_PERMISSIONS = 'requiredPermissions';

/**
 * Guard que aceita autenticação via JWT OU API Key
 *
 * Uso:
 * @UseGuards(ApiKeyGuard)
 * @AllowApiKey() // Permite API Key neste endpoint
 * @RequirePermissions('read:orcamentos') // Opcional: requer permissão específica
 */
@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    @InjectRepository(ApiKey)
    private readonly apiKeyRepository: Repository<ApiKey>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Token de autenticação não fornecido');
    }

    // Verificar se é API Key (formato: "ApiKey sk_live_xxx")
    if (authHeader.startsWith('ApiKey ')) {
      return this.validateApiKey(authHeader, request, context);
    }

    // Verificar se é Bearer JWT (formato: "Bearer eyJxxx")
    if (authHeader.startsWith('Bearer ')) {
      return this.validateJwt(authHeader, request);
    }

    throw new UnauthorizedException('Formato de autenticação inválido');
  }

  private async validateApiKey(
    authHeader: string,
    request: any,
    context: ExecutionContext,
  ): Promise<boolean> {
    // Verificar se endpoint permite API Key
    const allowApiKey = this.reflector.getAllAndOverride<boolean>(ALLOW_API_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!allowApiKey) {
      throw new UnauthorizedException('Este endpoint não aceita autenticação via API Key');
    }

    const apiKeyValue = authHeader.substring(7); // Remove "ApiKey "
    const prefix = apiKeyValue.substring(0, 12); // Primeiros 12 caracteres como prefixo
    const keyHash = this.hashApiKey(apiKeyValue);

    // Buscar API Key no banco
    const apiKey = await this.apiKeyRepository.findOne({
      where: { key: keyHash, isActive: true },
      relations: ['createdBy'],
    });

    if (!apiKey) {
      throw new UnauthorizedException('API Key inválida');
    }

    // Verificar expiração
    if (apiKey.expiresAt && new Date(apiKey.expiresAt) < new Date()) {
      throw new UnauthorizedException('API Key expirada');
    }

    // Verificar IP (se configurado)
    if (apiKey.allowedIps && apiKey.allowedIps.length > 0) {
      const clientIp = request.ip || request.connection.remoteAddress;
      if (!apiKey.allowedIps.includes(clientIp)) {
        throw new UnauthorizedException('IP não autorizado para esta API Key');
      }
    }

    // Verificar permissões requeridas
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      REQUIRED_PERMISSIONS,
      [context.getHandler(), context.getClass()],
    );

    if (requiredPermissions && requiredPermissions.length > 0) {
      const hasPermission = requiredPermissions.every(
        (perm) => apiKey.permissions?.includes(perm) || apiKey.permissions?.includes('*'),
      );
      if (!hasPermission) {
        throw new UnauthorizedException('API Key não possui as permissões necessárias');
      }
    }

    // Atualizar lastUsedAt e usageCount
    await this.apiKeyRepository.update(apiKey.id, {
      lastUsedAt: new Date(),
      usageCount: () => 'usageCount + 1',
    });

    // Adicionar informações do usuário ao request
    request.user = {
      userId: apiKey.created_by,
      email: apiKey.createdBy?.email,
      isApiKey: true,
      apiKeyId: apiKey.id,
      apiKeyName: apiKey.name,
      permissions: apiKey.permissions || [],
    };

    return true;
  }

  private async validateJwt(authHeader: string, request: any): Promise<boolean> {
    const token = authHeader.substring(7); // Remove "Bearer "

    try {
      const payload = this.jwtService.verify(token);
      request.user = {
        userId: payload.sub,
        email: payload.email,
        isApiKey: false,
      };
      return true;
    } catch (error) {
      throw new UnauthorizedException('Token JWT inválido ou expirado');
    }
  }

  private hashApiKey(key: string): string {
    return crypto.createHash('sha256').update(key).digest('hex');
  }
}
