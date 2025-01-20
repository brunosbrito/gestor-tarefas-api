import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityHistoryService } from './activity-history.service';
import { ActivityHistoryController } from './activity-history.controller';
import { ActivityHistory } from './entities/activity-history.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { Activity } from 'src/modules/activities/entities/activities.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ActivityHistory, User, Activity])],
  providers: [ActivityHistoryService],
  controllers: [ActivityHistoryController],
})
export class ActivityHistoryModule {}
