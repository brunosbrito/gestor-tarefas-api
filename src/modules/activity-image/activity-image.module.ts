import { Module } from '@nestjs/common';
import { ActivityImageController } from './activity-image.controller';
import { ActivityImageService } from './activity-image.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityImage } from './entities/activity-image.entity';
import { HttpModule } from '@nestjs/axios';
import { User } from '../user/entities/user.entity';
import { Activity } from '../activities/entities/activities.entity';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { editFileName } from 'src/util/util-file';
import { UPLOAD_PATH } from 'src/util/constants';

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: UPLOAD_PATH,
        filename: editFileName,
      }),
    }),
    TypeOrmModule.forFeature([ActivityImage, User, Activity]),
    HttpModule,
  ],
  controllers: [ActivityImageController],
  providers: [ActivityImageService],
})
export class ActivityImageModule {}
