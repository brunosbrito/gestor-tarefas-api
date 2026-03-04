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
import { CargosService } from './cargos.service';
import { CreateCargoDto } from './dto/create-cargo.dto';
import { UpdateCargoDto } from './dto/update-cargo.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CategoriaCargo } from './entities/cargo.entity';

@Controller('cargos')
@UseGuards(JwtAuthGuard)
export class CargosController {
  constructor(private readonly service: CargosService) {}

  @Post()
  create(@Body() dto: CreateCargoDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(
    @Query('busca') busca?: string,
    @Query('categoria') categoria?: CategoriaCargo,
    @Query('ativo') ativo?: string,
  ) {
    return this.service.findAll({
      busca,
      categoria,
      ativo: ativo === undefined ? undefined : ativo === 'true',
    });
  }

  @Get('ativos')
  findAtivos() {
    return this.service.findAll({ ativo: true });
  }

  @Get('categoria/:categoria')
  findByCategoria(@Param('categoria') categoria: CategoriaCargo) {
    return this.service.findByCategoria(categoria);
  }

  @Post('seed')
  seed() {
    return this.service.seed();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCargoDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Delete(':id/hard')
  @HttpCode(HttpStatus.NO_CONTENT)
  hardDelete(@Param('id') id: string) {
    return this.service.hardDelete(id);
  }
}
