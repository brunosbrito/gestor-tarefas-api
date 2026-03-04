import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ferramenta } from './entities/ferramenta.entity';
import { FerramentasController } from './ferramentas.controller';
import { FerramentasService } from './ferramentas.service';

@Module({
  imports: [TypeOrmModule.forFeature([Ferramenta])],
  controllers: [FerramentasController],
  providers: [FerramentasService],
  exports: [FerramentasService],
})
export class FerramentasModule {}
