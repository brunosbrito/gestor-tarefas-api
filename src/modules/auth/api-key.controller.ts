import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ApiKeyService } from './api-key.service';
import { CreateApiKeyDto, UpdateApiKeyDto } from './dto/api-key.dto';

@Controller('api-keys')
@UseGuards(JwtAuthGuard) // Apenas usuários autenticados podem gerenciar API Keys
export class ApiKeyController {
  constructor(private readonly apiKeyService: ApiKeyService) {}

  /**
   * POST /api/api-keys
   * Cria uma nova API Key
   *
   * @returns A chave completa (APENAS retornada uma vez!)
   */
  @Post()
  create(@Body() dto: CreateApiKeyDto, @Request() req) {
    return this.apiKeyService.create(dto, req.user.userId);
  }

  /**
   * GET /api/api-keys
   * Lista todas as API Keys do usuário
   */
  @Get()
  findAll(@Request() req) {
    return this.apiKeyService.findAll(req.user.userId);
  }

  /**
   * GET /api/api-keys/:id
   * Busca uma API Key específica
   */
  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.apiKeyService.findOne(id, req.user.userId);
  }

  /**
   * PUT /api/api-keys/:id
   * Atualiza uma API Key
   */
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateApiKeyDto, @Request() req) {
    return this.apiKeyService.update(id, dto, req.user.userId);
  }

  /**
   * POST /api/api-keys/:id/revoke
   * Revoga (desativa) uma API Key
   */
  @Post(':id/revoke')
  @HttpCode(HttpStatus.NO_CONTENT)
  revoke(@Param('id') id: string, @Request() req) {
    return this.apiKeyService.revoke(id, req.user.userId);
  }

  /**
   * POST /api/api-keys/:id/regenerate
   * Regenera a chave (nova chave, mesmas configurações)
   *
   * @returns A nova chave completa
   */
  @Post(':id/regenerate')
  regenerate(@Param('id') id: string, @Request() req) {
    return this.apiKeyService.regenerate(id, req.user.userId);
  }

  /**
   * DELETE /api/api-keys/:id
   * Remove permanentemente uma API Key
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @Request() req) {
    return this.apiKeyService.remove(id, req.user.userId);
  }
}
