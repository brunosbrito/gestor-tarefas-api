import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RncImageService } from './rnc-image.service';
import { RncImageController } from './rnc-image.controller';
import { RncImage } from './entities/rnc-image.entity';
import { NonConformityModule } from '../non-conformity/non-conformity.module';
import { NonConformity } from '../non-conformity/entities/non-conformity.entity';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { UPLOAD_PATH } from 'src/util/constants';
import { editFileName } from 'src/util/util-file';

@Module({
  imports: [
    MulterModule.register({
          storage: diskStorage({
            destination: UPLOAD_PATH,
            filename: editFileName,
          }),
        }),
    TypeOrmModule.forFeature([RncImage, NonConformity]),
    forwardRef(() => NonConformityModule),
  ],
  providers: [RncImageService],
  controllers: [RncImageController],
})
export class RncImageModule {}
