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
import { ConsumiveisService } from './consumiveis.service';
import { CreateConsumivelDto } from './dto/create-consumivel.dto';
import { UpdateConsumivelDto } from './dto/update-consumivel.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CategoriaConsumivel } from './entities/consumivel.entity';

@Controller('consumiveis')
@UseGuards(JwtAuthGuard)
export class ConsumiveisController {
  constructor(private readonly service: ConsumiveisService) {}

  @Post()
  create(@Body() dto: CreateConsumivelDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(
    @Query('busca') busca?: string,
    @Query('categoria') categoria?: CategoriaConsumivel,
    @Query('ativo') ativo?: string,
  ) {
    return this.service.findAll({
      busca,
      categoria,
      ativo: ativo === undefined ? undefined : ativo === 'true',
    });
  }

  @Get('categoria/:categoria')
  findByCategoria(@Param('categoria') categoria: CategoriaConsumivel) {
    return this.service.findByCategoria(categoria);
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
  update(@Param('id') id: string, @Body() dto: UpdateConsumivelDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
