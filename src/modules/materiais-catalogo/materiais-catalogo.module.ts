import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MaterialCatalogo } from './entities/material-catalogo.entity';
import { MateriaisCatalogoController } from './materiais-catalogo.controller';
import { MateriaisCatalogoService } from './materiais-catalogo.service';

@Module({
  imports: [TypeOrmModule.forFeature([MaterialCatalogo])],
  controllers: [MateriaisCatalogoController],
  providers: [MateriaisCatalogoService],
  exports: [MateriaisCatalogoService],
})
export class MateriaisCatalogoModule {}
