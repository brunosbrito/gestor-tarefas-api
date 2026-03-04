import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Consumivel } from './entities/consumivel.entity';
import { ConsumiveisController } from './consumiveis.controller';
import { ConsumiveisService } from './consumiveis.service';

@Module({
  imports: [TypeOrmModule.forFeature([Consumivel])],
  controllers: [ConsumiveisController],
  providers: [ConsumiveisService],
  exports: [ConsumiveisService],
})
export class ConsumiveisModule {}
