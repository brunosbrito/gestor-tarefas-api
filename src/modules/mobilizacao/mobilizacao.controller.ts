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
import { MobilizacaoService } from './mobilizacao.service';
import { CreateMobilizacaoDto } from './dto/create-mobilizacao.dto';
import { UpdateMobilizacaoDto } from './dto/update-mobilizacao.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TipoMobilizacao, CategoriaMobilizacao } from './entities/mobilizacao.entity';

@Controller('mobilizacao')
@UseGuards(JwtAuthGuard)
export class MobilizacaoController {
  constructor(private readonly service: MobilizacaoService) {}

  @Post()
  create(@Body() dto: CreateMobilizacaoDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(
    @Query('busca') busca?: string,
    @Query('tipo') tipo?: TipoMobilizacao,
    @Query('categoria') categoria?: CategoriaMobilizacao,
    @Query('ativo') ativo?: string,
  ) {
    return this.service.findAll({
      busca,
      tipo,
      categoria,
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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateMobilizacaoDto) {
    return this.service.update(+id, dto);
  }

  @Patch(':id/toggle-ativo')
  toggleAtivo(@Param('id') id: string) {
    return this.service.toggleAtivo(+id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
