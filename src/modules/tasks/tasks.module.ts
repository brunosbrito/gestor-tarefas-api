import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { ActivitiesModule } from '../activities/activities.module';

@Module({
  imports: [ActivitiesModule],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
