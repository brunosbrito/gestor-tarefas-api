import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Delete,
  HttpCode,
  Put,
  UseInterceptors,
  UploadedFiles,
  Patch,
} from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { UPLOAD_PATH } from 'src/util/constants';
import { editFileName } from 'src/util/util-file';
import { UpdateCompletedQuantityDto } from './dto/update-completedQuantity.dto';

@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Post()
  @UseInterceptors(
    AnyFilesInterceptor({
      storage: diskStorage({
        destination: UPLOAD_PATH,
        filename: editFileName,
      }),
      limits: {
        fileSize: 10 * 1024 * 1024, // Limite de tamanho (10 MB)
      },
    }),
  )
  create(@Body() createActivityDto: CreateActivityDto, @UploadedFiles() files) {
    // Verificar se há arquivos no request
    if (!files || files.length === 0) {
      return this.activitiesService.create(createActivityDto);
    }

    // Filtrar arquivos por tipo
    const images = files.filter((file) => file.mimetype.startsWith('image/'));
    const pdfs = files.filter((file) => file.mimetype === 'application/pdf');

    // Definir caminhos (evitar erro de undefined)
    const imagePath = images.length > 0 ? `/files/${images[0].filename}` : null;
    const filePath = pdfs.length > 0 ? `/files/${pdfs[0].filename}` : null;

    // Criar novo DTO com URLs dos arquivos
    const newDto: CreateActivityDto = {
      ...createActivityDto,
      imageUrl: imagePath,
      fileUrl: filePath,
    };

    return this.activitiesService.create(newDto);
  }

  @Get()
  findAll() {
    return this.activitiesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.activitiesService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() updateActivityDto: UpdateActivityDto,
  ) {
    console.log(updateActivityDto, 'dd');
    return this.activitiesService.update(id, updateActivityDto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: number) {
    return this.activitiesService.remove(id);
  }

  @Get('service-order/:id')
  findByServiceOrder(@Param('id') id: number) {
    return this.activitiesService.findByServiceOrder(id);
  }
}
