import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkedHours } from './entities/worked-hours.entity';
import { WorkedHoursService } from './worked-hours.service';
import { WorkedHoursController } from './worked-hours.controller';

@Module({
  imports: [TypeOrmModule.forFeature([WorkedHours])],
  controllers: [WorkedHoursController],
  providers: [WorkedHoursService],
})
export class WorkedHoursModule {}
