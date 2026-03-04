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
import { TintasService } from './tintas.service';
import { CreateTintaDto } from './dto/create-tinta.dto';
import { UpdateTintaDto } from './dto/update-tinta.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TipoTinta } from './entities/tinta.entity';

@Controller('tintas')
@UseGuards(JwtAuthGuard)
export class TintasController {
  constructor(private readonly service: TintasService) {}

  @Post()
  create(@Body() dto: CreateTintaDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(
    @Query('busca') busca?: string,
    @Query('tipo') tipo?: TipoTinta,
    @Query('fornecedor') fornecedor?: string,
    @Query('ativo') ativo?: string,
  ) {
    return this.service.findAll({
      busca,
      tipo,
      fornecedor,
      ativo: ativo === undefined ? undefined : ativo === 'true',
    });
  }

  @Get('tipo/:tipo')
  findByTipo(@Param('tipo') tipo: TipoTinta) {
    return this.service.findByTipo(tipo);
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
  update(@Param('id') id: string, @Body() dto: UpdateTintaDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
