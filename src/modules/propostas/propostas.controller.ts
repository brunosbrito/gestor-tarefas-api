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
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PropostasService } from './propostas.service';
import { CreatePropostaDto } from './dto/create-proposta.dto';
import { UpdatePropostaDto, UpdateStatusDto } from './dto/update-proposta.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { StatusProposta } from './entities/proposta.entity';

@Controller('propostas')
@UseGuards(JwtAuthGuard)
export class PropostasController {
  constructor(private readonly service: PropostasService) {}

  @Post()
  create(@Body() dto: CreatePropostaDto, @Request() req: any) {
    const userId = req.user?.userId || 1;
    return this.service.create(dto, userId);
  }

  @Get()
  findAll(
    @Query('status') status?: StatusProposta,
    @Query('clienteNome') clienteNome?: string,
    @Query('dataInicio') dataInicio?: string,
    @Query('dataFim') dataFim?: string,
    @Query('vendedor') vendedor?: string,
  ) {
    return this.service.findAll({
      status,
      clienteNome,
      dataInicio,
      dataFim,
      vendedor,
    });
  }

  @Get('numero/proximo')
  getProximoNumero() {
    return this.service.getProximoNumero();
  }

  @Get('cliente/:cnpj')
  findByCliente(@Param('cnpj') cnpj: string) {
    return this.service.findByCliente(cnpj);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePropostaDto) {
    return this.service.update(id, dto);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateStatusDto) {
    return this.service.updateStatus(id, dto);
  }

  @Post(':id/clonar')
  clonar(@Param('id') id: string, @Request() req: any) {
    const userId = req.user?.userId || 1;
    return this.service.clonar(id, userId);
  }

  @Post(':id/vincular-orcamento')
  vincularOrcamento(
    @Param('id') id: string,
    @Body('orcamentoId') orcamentoId: string,
  ) {
    return this.service.vincularOrcamento(id, orcamentoId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  // ==========================================
  // ITENS
  // ==========================================

  @Post(':id/itens')
  createItem(
    @Param('id') propostaId: string,
    @Body() itemDto: {
      nome: string;
      tipo: 'produto' | 'servico';
      quantidade: number;
      unidade?: string;
      valorUnitario: number;
      observacao?: string;
    },
  ) {
    return this.service.createItem(propostaId, itemDto);
  }

  @Put(':id/itens/:itemId')
  updateItem(
    @Param('id') propostaId: string,
    @Param('itemId') itemId: string,
    @Body() itemDto: Partial<{
      nome: string;
      tipo: 'produto' | 'servico';
      quantidade: number;
      unidade?: string;
      valorUnitario: number;
      observacao?: string;
    }>,
  ) {
    return this.service.updateItem(propostaId, itemId, itemDto);
  }

  @Delete(':id/itens/:itemId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeItem(
    @Param('id') propostaId: string,
    @Param('itemId') itemId: string,
  ) {
    return this.service.removeItem(propostaId, itemId);
  }
}
