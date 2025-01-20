import { Module } from '@nestjs/common';
import { ActivityImageController } from './activity-image.controller';
import { ActivityImageService } from './activity-image.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityImage } from './entities/activity-image.entity';
import { HttpModule } from '@nestjs/axios';
import { User } from '../user/entities/user.entity';
import { Activity } from '../activities/entities/activities.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ActivityImage, User, Activity]),
    HttpModule,
  ], // Certificando-se de que o UserModule é importado
  controllers: [ActivityImageController],
  providers: [ActivityImageService],
})
export class ActivityImageModule {}
