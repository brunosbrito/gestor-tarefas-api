import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Orcamento } from './entities/orcamento.entity';
import { ComposicaoCustos } from './entities/composicao-custos.entity';
import { ItemComposicao } from './entities/item-composicao.entity';
import { Acao5S } from './entities/acao-5s.entity';
import { OrcamentosController } from './orcamentos.controller';
import { OrcamentosService } from './orcamentos.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Orcamento, ComposicaoCustos, ItemComposicao, Acao5S]),
  ],
  controllers: [OrcamentosController],
  providers: [OrcamentosService],
  exports: [OrcamentosService],
})
export class OrcamentosModule {}
