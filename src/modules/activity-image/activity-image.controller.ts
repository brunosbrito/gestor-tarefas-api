import {
  Controller,
  Post,
  UploadedFile,
  Param,
  Body,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ActivityImageService } from './activity-image.service';
import { CreateActivityImageDto } from './dto/create-activity-image.dto';
import { imageFileFilter } from 'src/util/util-file';

@Controller('activity-images')
export class ActivityImageController {
  constructor(private readonly activityImageService: ActivityImageService) {}

  @Post('upload/:activityId')
  @UseInterceptors(
    FileInterceptor('image', {
      limits: {
        fileSize: 10 * 1024 * 1024, // Limite de tamanho (10 MB)
      },
      fileFilter: imageFileFilter, // Validação de tipo de arquivo
    }),
  )
  async uploadImage(
    @Param('activityId') activityId: number,
    @UploadedFile() file: Express.Multer.File,
    @Body() createActivityImageDto: CreateActivityImageDto,
  ) {
    const filePath = `/files/${file.filename}`;

    const newDto: CreateActivityImageDto = {
      ...createActivityImageDto,
      activityId: Number(activityId),
      imageName: file.originalname,
      imagePath: filePath,
      createdById: Number(createActivityImageDto.createdById),
    };

    return this.activityImageService.create(newDto); // Salva no banco de dados
  }
}
