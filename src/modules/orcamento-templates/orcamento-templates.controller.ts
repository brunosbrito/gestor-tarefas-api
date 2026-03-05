import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { OrcamentoTemplatesService } from './orcamento-templates.service';
import { CreateOrcamentoTemplateDto } from './dto/create-orcamento-template.dto';
import { UpdateOrcamentoTemplateDto } from './dto/update-orcamento-template.dto';
import { UsarTemplateDto } from './dto/usar-template.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TemplateCategoriaEnum } from './entities/orcamento-template.entity';

@Controller('orcamentos/templates')
@UseGuards(JwtAuthGuard)
export class OrcamentoTemplatesController {
  constructor(
    private readonly templatesService: OrcamentoTemplatesService,
  ) {}

  @Get()
  findAll(
    @Query('categoria') categoria?: TemplateCategoriaEnum,
    @Query('ativo') ativo?: string,
  ) {
    const ativoBoolean = ativo !== undefined ? ativo === 'true' : undefined;
    return this.templatesService.findAll(categoria, ativoBoolean);
  }

  @Post()
  create(@Body() dto: CreateOrcamentoTemplateDto, @Request() req) {
    const userId = req.user?.userId || 1;
    return this.templatesService.create(dto, userId);
  }

  @Post('seed')
  seed() {
    return this.templatesService.seed();
  }

  @Post('from-orcamento/:orcamentoId')
  criarDeOrcamento(
    @Param('orcamentoId') orcamentoId: string,
    @Body() data: { nomeTemplate: string; descricaoTemplate: string; categoria: TemplateCategoriaEnum },
    @Request() req,
  ) {
    const userId = req.user?.userId || 1;
    return this.templatesService.criarDeOrcamento(orcamentoId, data, userId);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.templatesService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() dto: UpdateOrcamentoTemplateDto) {
    return this.templatesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: number) {
    return this.templatesService.remove(id);
  }

  @Post(':id/usar')
  usarTemplate(
    @Param('id') id: number,
    @Body() dto: UsarTemplateDto,
    @Request() req,
  ) {
    const userId = req.user?.userId || 1;
    return this.templatesService.usarTemplate(id, dto, userId);
  }

  @Post(':id/duplicar')
  duplicar(@Param('id') id: number, @Body() body: { novoNome: string }) {
    return this.templatesService.duplicar(id, body.novoNome);
  }

  @Patch(':id/toggle-ativo')
  toggleAtivo(@Param('id') id: number, @Body() body: { ativo: boolean }) {
    return this.templatesService.toggleAtivo(id, body.ativo);
  }
}
