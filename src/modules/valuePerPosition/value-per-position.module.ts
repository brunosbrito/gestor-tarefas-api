import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ValuePerPositionService } from './value-per-position.service';
import { ValuePerPositionController } from './value-per-position.controller';
import { ValuePerPosition } from './entity/value-per-position.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ValuePerPosition])],
  controllers: [ValuePerPositionController],
  providers: [ValuePerPositionService],
})
export class ValuePerPositionModule {}
