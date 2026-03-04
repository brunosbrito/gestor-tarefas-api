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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { MateriaisCatalogoService } from './materiais-catalogo.service';
import { CreateMaterialCatalogoDto } from './dto/create-material-catalogo.dto';
import { UpdateMaterialCatalogoDto } from './dto/update-material-catalogo.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MaterialCategoria } from './entities/material-catalogo.entity';

@Controller('materiais-catalogo')
@UseGuards(JwtAuthGuard)
export class MateriaisCatalogoController {
  constructor(private readonly service: MateriaisCatalogoService) {}

  @Post()
  create(@Body() dto: CreateMaterialCatalogoDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(
    @Query('busca') busca?: string,
    @Query('categoria') categoria?: MaterialCategoria,
    @Query('fornecedor') fornecedor?: string,
    @Query('ativo') ativo?: string,
  ) {
    return this.service.findAll({
      busca,
      categoria,
      fornecedor,
      ativo: ativo === undefined ? undefined : ativo === 'true',
    });
  }

  @Get('categoria/:categoria')
  findByCategoria(@Param('categoria') categoria: MaterialCategoria) {
    return this.service.findByCategoria(categoria);
  }

  @Get('fornecedor/:fornecedor')
  findByFornecedor(@Param('fornecedor') fornecedor: string) {
    return this.service.findByFornecedor(fornecedor);
  }

  @Post('seed')
  seed() {
    return this.service.seed();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateMaterialCatalogoDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
