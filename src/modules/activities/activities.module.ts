import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivitiesService } from './activities.service';
import { ActivitiesController } from './activities.controller';
import { Activity } from './entities/activities.entity';
import { Collaborator } from '../collaborator/entities/collaborator.entity';
import { Project } from '../work/entities/project.entity';
import { ServiceOrder } from '../service_order/entities/service_order.entity';
import { ActivityHistory } from '../activity-history/entities/activity-history.entity';
import { User } from '../user/entities/user.entity';
import { WorkedHours } from '../worked-hours/entities/worked-hours.entity';
import { HttpModule } from '@nestjs/axios';
import { ActivityImage } from '../activity-image/entities/activity-image.entity';
import { Process } from '../processes/entities/process.entity';
import { MacroTask } from '../macro-task/entities/macro-task.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Activity,
      Collaborator,
      Project,
      ServiceOrder,
      ActivityHistory,
      User,
      WorkedHours,
      ActivityImage,
      Process,
      MacroTask,
    ]),
    HttpModule,
  ],
  controllers: [ActivitiesController],
  providers: [ActivitiesService],
  exports: [ActivitiesService],
})
export class ActivitiesModule {}
