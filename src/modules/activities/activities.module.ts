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
    ]),
    HttpModule,
  ],
  controllers: [ActivitiesController],
  providers: [ActivitiesService],
})
export class ActivitiesModule {}
