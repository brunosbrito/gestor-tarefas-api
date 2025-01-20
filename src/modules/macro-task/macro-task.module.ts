import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MacroTaskService } from './macro-task.service';
import { MacroTaskController } from './macro-task.controller';
import { MacroTask } from './entities/macro-task.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MacroTask])],
  controllers: [MacroTaskController],
  providers: [MacroTaskService],
  exports: [MacroTaskService],
})
export class MacroTaskModule {}
