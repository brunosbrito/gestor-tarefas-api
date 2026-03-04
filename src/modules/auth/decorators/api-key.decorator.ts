import { SetMetadata } from '@nestjs/common';
import { ALLOW_API_KEY, REQUIRED_PERMISSIONS } from '../api-key.guard';

/**
 * Permite que o endpoint aceite autenticação via API Key
 *
 * @example
 * @Get('dados')
 * @UseGuards(ApiKeyGuard)
 * @AllowApiKey()
 * getDados() { ... }
 */
export const AllowApiKey = () => SetMetadata(ALLOW_API_KEY, true);

/**
 * Define as permissões necessárias para acessar o endpoint
 * Funciona apenas com API Keys (usuários JWT têm acesso total)
 *
 * @example
 * @Get('orcamentos')
 * @UseGuards(ApiKeyGuard)
 * @AllowApiKey()
 * @RequirePermissions('read:orcamentos')
 * getOrcamentos() { ... }
 */
export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(REQUIRED_PERMISSIONS, permissions);
