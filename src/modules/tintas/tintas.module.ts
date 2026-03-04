import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tinta } from './entities/tinta.entity';
import { TintasController } from './tintas.controller';
import { TintasService } from './tintas.service';

@Module({
  imports: [TypeOrmModule.forFeature([Tinta])],
  controllers: [TintasController],
  providers: [TintasService],
  exports: [TintasService],
})
export class TintasModule {}
