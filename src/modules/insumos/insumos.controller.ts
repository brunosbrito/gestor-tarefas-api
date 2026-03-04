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
} from '@nestjs/common';
import { InsumosService } from './insumos.service';
import { CreateInsumoDto } from './dto/create-insumo.dto';
import { UpdateInsumoDto } from './dto/update-insumo.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CategoriaInsumo } from './entities/insumo.entity';

@Controller('insumos')
@UseGuards(JwtAuthGuard)
export class InsumosController {
  constructor(private readonly insumosService: InsumosService) {}

  /**
   * POST /api/insumos
   * Criar novo insumo
   */
  @Post()
  create(@Body() dto: CreateInsumoDto) {
    return this.insumosService.create(dto);
  }

  /**
   * GET /api/insumos
   * Listar todos os insumos (filtro opcional por categoria)
   */
  @Get()
  findAll(@Query('categoria') categoria?: CategoriaInsumo) {
    return this.insumosService.findAll(categoria);
  }

  /**
   * GET /api/insumos/search?termo=xxx
   * Buscar insumos por termo
   */
  @Get('search')
  search(@Query('termo') termo: string) {
    return this.insumosService.search(termo || '');
  }

  /**
   * POST /api/insumos/seed
   * Popular banco com insumos padrão
   */
  @Post('seed')
  seed() {
    return this.insumosService.seed();
  }

  /**
   * GET /api/insumos/codigo/:codigo
   * Buscar insumo por código
   */
  @Get('codigo/:codigo')
  findByCodigo(@Param('codigo') codigo: string) {
    return this.insumosService.findByCodigo(codigo);
  }

  /**
   * GET /api/insumos/:id
   * Buscar insumo por ID
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.insumosService.findOne(id);
  }

  /**
   * PUT /api/insumos/:id
   * Atualizar insumo
   */
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateInsumoDto) {
    return this.insumosService.update(id, dto);
  }

  /**
   * DELETE /api/insumos/:id
   * Desativar insumo (soft delete)
   */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.insumosService.remove(id);
  }
}
