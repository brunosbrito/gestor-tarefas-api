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
import { FerramentasService } from './ferramentas.service';
import { CreateFerramentaDto } from './dto/create-ferramenta.dto';
import { UpdateFerramentaDto } from './dto/update-ferramenta.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TipoFerramenta } from './entities/ferramenta.entity';

@Controller('ferramentas')
@UseGuards(JwtAuthGuard)
export class FerramentasController {
  constructor(private readonly service: FerramentasService) {}

  @Post()
  create(@Body() dto: CreateFerramentaDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(
    @Query('busca') busca?: string,
    @Query('tipo') tipo?: TipoFerramenta,
    @Query('ativo') ativo?: string,
  ) {
    return this.service.findAll({
      busca,
      tipo,
      ativo: ativo === undefined ? undefined : ativo === 'true',
    });
  }

  @Get('tipo/:tipo')
  findByTipo(@Param('tipo') tipo: TipoFerramenta) {
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
  update(@Param('id') id: string, @Body() dto: UpdateFerramentaDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
