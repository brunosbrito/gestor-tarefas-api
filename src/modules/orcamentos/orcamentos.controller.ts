import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { OrcamentosService } from './orcamentos.service';
import { CreateOrcamentoDto } from './dto/create-orcamento.dto';
import { UpdateOrcamentoDto } from './dto/update-orcamento.dto';
import { CreateAcao5SDto } from './dto/acao-5s.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OrcamentoTipo } from './entities/orcamento.entity';

@Controller('orcamentos')
@UseGuards(JwtAuthGuard)
export class OrcamentosController {
  constructor(private readonly orcamentosService: OrcamentosService) {}

  /**
   * POST /api/orcamentos
   * Criar novo orçamento com 10 composições padrão
   */
  @Post()
  create(@Body() dto: CreateOrcamentoDto, @Request() req) {
    const userId = req.user?.userId || 1;
    return this.orcamentosService.create(dto, userId);
  }

  /**
   * GET /api/orcamentos
   * Listar todos os orçamentos com campos calculados
   */
  @Get()
  findAll() {
    return this.orcamentosService.findAll();
  }

  /**
   * GET /api/orcamentos/numero/proximo
   * Retorna o próximo número disponível
   */
  @Get('numero/proximo')
  getProximoNumero(@Query('tipo') tipo?: OrcamentoTipo) {
    return this.orcamentosService.getProximoNumero(tipo || 'servico');
  }

  /**
   * GET /api/orcamentos/cliente/:cnpj
   * Buscar orçamentos por CNPJ do cliente
   */
  @Get('cliente/:cnpj')
  findByCliente(@Param('cnpj') cnpj: string) {
    return this.orcamentosService.findByCliente(cnpj);
  }

  /**
   * POST /api/orcamentos/seed
   * Popular banco de dados com orçamentos de exemplo
   */
  @Post('seed')
  seed() {
    return this.orcamentosService.seed();
  }

  /**
   * GET /api/orcamentos/kpis
   * Retorna KPIs comerciais calculados para um mês específico
   * @query mesAno - Formato "YYYY-MM" (opcional, default: mês atual)
   */
  @Get('kpis')
  getKpis(@Query('mesAno') mesAno?: string) {
    return this.orcamentosService.calcularKpis(mesAno);
  }

  // ==========================================
  // AÇÕES 5S
  // ==========================================

  /**
   * GET /api/orcamentos/acoes-5s
   * Lista todas as ações 5S (filtro opcional por mês)
   * @query mesAno - Formato "YYYY-MM" (opcional)
   */
  @Get('acoes-5s')
  findAcoes5S(@Query('mesAno') mesAno?: string) {
    return this.orcamentosService.findAcoes5S(mesAno);
  }

  /**
   * POST /api/orcamentos/acoes-5s
   * Cria uma nova ação 5S
   */
  @Post('acoes-5s')
  createAcao5S(@Body() dto: CreateAcao5SDto, @Request() req) {
    const userId = req.user?.userId || 1;
    return this.orcamentosService.createAcao5S(dto, userId);
  }

  /**
   * DELETE /api/orcamentos/acoes-5s/:id
   * Remove uma ação 5S
   */
  @Delete('acoes-5s/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeAcao5S(@Param('id') id: string) {
    return this.orcamentosService.removeAcao5S(id);
  }

  /**
   * GET /api/orcamentos/:id
   * Buscar orçamento por ID com composições e itens
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orcamentosService.findOne(id);
  }

  /**
   * PUT /api/orcamentos/:id
   * Atualizar orçamento (incluindo composições e itens em cascata)
   */
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateOrcamentoDto) {
    return this.orcamentosService.update(id, dto);
  }

  /**
   * DELETE /api/orcamentos/:id
   * Excluir orçamento
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.orcamentosService.remove(id);
  }

  /**
   * POST /api/orcamentos/:id/clonar
   * Clonar um orçamento existente
   */
  @Post(':id/clonar')
  clonar(@Param('id') id: string, @Request() req) {
    const userId = req.user?.userId || 1;
    return this.orcamentosService.clonar(id, userId);
  }
}
