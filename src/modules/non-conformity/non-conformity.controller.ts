import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { NonConformityService } from './non-conformity.service';
import { CreateNonConformityDto } from './dto/create-non-conformity.dto';
import { UpdateNonConformityDto } from './dto/update-non-conformity.dto';

@Controller('non-conformities')
export class NonConformityController {
  constructor(private readonly nonConformityService: NonConformityService) {}

  @Post()
  create(@Body() dto: CreateNonConformityDto) {
    return this.nonConformityService.create(dto);
  }

  @Get()
  findAll() {
    return this.nonConformityService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.nonConformityService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateNonConformityDto) {
    return this.nonConformityService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.nonConformityService.remove(id);
  }
}
