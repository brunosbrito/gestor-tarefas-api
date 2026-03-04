import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Epi } from './entities/epi.entity';
import { EpisService } from './epis.service';
import { EpisController } from './epis.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Epi])],
  controllers: [EpisController],
  providers: [EpisService],
  exports: [EpisService],
})
export class EpisModule {}
