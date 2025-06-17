import {
  Controller,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
  Get,
  Param,
  Delete,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { RncImageService } from './rnc-image.service';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';
import { imageFileFilter } from 'src/util/util-file';

@Controller('rnc-images')
export class RncImageController {
  constructor(private readonly rncImageService: RncImageService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 10 * 1024 * 1024, // Limite de tamanho (10 MB)
      },
      fileFilter: imageFileFilter, // Validação de tipo de arquivo
    }),
  )
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Body('nonConformityId') nonConformityId: string,
    @Body('description') description: string,
  ) {
    return this.rncImageService.create(file, nonConformityId, description);
  }

  @Get(':nonConformityId')
  async findByNonConformity(@Param('nonConformityId') id: string) {
    return this.rncImageService.findByNonConformity(id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.rncImageService.remove(id);
  }
}
