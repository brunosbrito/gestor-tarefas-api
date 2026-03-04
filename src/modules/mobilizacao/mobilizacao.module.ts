import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mobilizacao } from './entities/mobilizacao.entity';
import { MobilizacaoService } from './mobilizacao.service';
import { MobilizacaoController } from './mobilizacao.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Mobilizacao])],
  controllers: [MobilizacaoController],
  providers: [MobilizacaoService],
  exports: [MobilizacaoService],
})
export class MobilizacaoModule {}
