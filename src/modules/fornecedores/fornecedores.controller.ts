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
import { FornecedoresService } from './fornecedores.service';
import { CreateFornecedorDto } from './dto/create-fornecedor.dto';
import { UpdateFornecedorDto } from './dto/update-fornecedor.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TipoFornecedor } from './entities/fornecedor.entity';

@Controller('fornecedores')
@UseGuards(JwtAuthGuard)
export class FornecedoresController {
  constructor(private readonly service: FornecedoresService) {}

  @Post()
  create(@Body() dto: CreateFornecedorDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(
    @Query('busca') busca?: string,
    @Query('tipo') tipo?: TipoFornecedor,
    @Query('ativo') ativo?: string,
  ) {
    return this.service.findAll({
      busca,
      tipo,
      ativo: ativo === undefined ? undefined : ativo === 'true',
    });
  }

  @Get('tipo/:tipo')
  findByTipo(@Param('tipo') tipo: TipoFornecedor) {
    return this.service.findByTipo(tipo);
  }

  @Get('cnpj/:cnpj')
  findByCnpj(@Param('cnpj') cnpj: string) {
    return this.service.findByCnpj(cnpj);
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
  update(@Param('id') id: string, @Body() dto: UpdateFornecedorDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
