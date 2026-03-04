import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Insumo } from './entities/insumo.entity';
import { InsumosController } from './insumos.controller';
import { InsumosService } from './insumos.service';

@Module({
  imports: [TypeOrmModule.forFeature([Insumo])],
  controllers: [InsumosController],
  providers: [InsumosService],
  exports: [InsumosService],
})
export class InsumosModule {}
