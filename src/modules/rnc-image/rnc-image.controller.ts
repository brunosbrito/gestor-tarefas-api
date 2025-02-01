import { Controller, Post, Body, Param, Get, Delete } from '@nestjs/common';
import { RncImageService } from './rnc-image.service';
import { CreateRncImageDto } from './dto/create-rnc-image.dto';

@Controller('rnc-images')
export class RncImageController {
  constructor(private readonly rncImageService: RncImageService) {}

  @Post()
  create(@Body() dto: CreateRncImageDto) {
    return this.rncImageService.create(dto);
  }

  @Get(':nonConformityId')
  findByNonConformity(@Param('nonConformityId') nonConformityId: string) {
    return this.rncImageService.findByNonConformity(nonConformityId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rncImageService.remove(id);
  }
}
