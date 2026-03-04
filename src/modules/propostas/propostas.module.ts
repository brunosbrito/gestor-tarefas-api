import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Proposta } from './entities/proposta.entity';
import { ItemProposta } from './entities/item-proposta.entity';
import { PropostasService } from './propostas.service';
import { PropostasController } from './propostas.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Proposta, ItemProposta])],
  controllers: [PropostasController],
  providers: [PropostasService],
  exports: [PropostasService],
})
export class PropostasModule {}
