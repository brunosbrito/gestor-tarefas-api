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

@Controller('rnc-images')
export class RncImageController {
  constructor(private readonly rncImageService: RncImageService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/rnc-images',
        filename: (req, file, callback) => {
          const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
          callback(null, uniqueName);
        },
      }),
    }),
  )
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Body('nonConformityId') nonConformityId: string,
  ) {
    return this.rncImageService.create(file, nonConformityId);
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
