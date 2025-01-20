import {
  Controller,
  Post,
  UploadedFile,
  Param,
  Body,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import { ActivityImageService } from './activity-image.service';
import { CreateActivityImageDto } from './dto/create-activity-image.dto';

@Controller('activity-images')
export class ActivityImageController {
  constructor(private readonly activityImageService: ActivityImageService) {}

  @Post('upload/:activityId')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: multer.memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 }, // Limite de 5MB
    }),
  )
  async uploadImage(
    @Param('activityId') activityId: number, // Recebe o ID da atividade da URL
    @UploadedFile() file: Express.Multer.File,
    @Body() createActivityImageDto: CreateActivityImageDto, // Recebe a descrição no corpo da requisição
  ) {
    const newDto: CreateActivityImageDto = {
      ...createActivityImageDto, // Mantém os dados do DTO enviado no corpo da requisição
      activityId: Number(activityId),
      imageName: file.originalname, // Define o nome do arquivo
      imageData: file.buffer, // Adiciona os dados do arquivo (em buffer)
      createdById: Number(createActivityImageDto.createdById),
    };
    return this.activityImageService.create(newDto);
  }
}
