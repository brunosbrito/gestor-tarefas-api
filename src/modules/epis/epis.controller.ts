import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { EpisService } from './epis.service';
import { CreateEpiDto } from './dto/create-epi.dto';
import { UpdateEpiDto } from './dto/update-epi.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('epis')
@UseGuards(JwtAuthGuard)
export class EpisController {
  constructor(private readonly service: EpisService) {}

  @Post()
  create(@Body() dto: CreateEpiDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(
    @Query('busca') busca?: string,
    @Query('ativo') ativo?: string,
  ) {
    return this.service.findAll({
      busca,
      ativo: ativo === undefined ? undefined : ativo === 'true',
    });
  }

  @Get('ativos')
  findAtivos() {
    return this.service.findAll({ ativo: true });
  }

  @Post('seed')
  seed() {
    return this.service.seed();
  }

  @Post('reajustar')
  reajustar(
    @Body() body: { tipo: 'percentual' | 'fixo'; valor: number; escopo: 'todos' | 'ativos' },
  ) {
    return this.service.reajustarPrecos(body.tipo, body.valor, body.escopo);
  }

  @Post('importar')
  importar(
    @Body() body: { dados: CreateEpiDto[]; substituir?: boolean },
  ) {
    return this.service.importar(body.dados, body.substituir || false);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateEpiDto) {
    return this.service.update(id, dto);
  }

  @Patch(':id/toggle-ativo')
  toggleAtivo(@Param('id') id: string) {
    return this.service.toggleAtivo(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
