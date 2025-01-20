import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EffectiveService } from './effective.service';
import { EffectiveController } from './effective.controller';
import { Effective } from './entities/effective.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Effective])],
  controllers: [EffectiveController],
  providers: [EffectiveService],
})
export class EffectiveModule {}
