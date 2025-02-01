import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { NonConformityService } from './non-conformity.service';
import { CreateNonConformityDto } from './dto/create-non-conformity.dto';

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
  findOne(@Param('id') id: string) {
    return this.nonConformityService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.nonConformityService.remove(id);
  }
}
