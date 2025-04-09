import { Controller, Get, Post, Body, Param, Delete, Patch, ParseIntPipe } from '@nestjs/common';
import { ValuePerPositionService } from './value-per-position.service';
import { CreateValuePerPositionDto } from './dto/create-value-per-position.dto';
import { UpdateValuePerPositionDto } from './dto/update-value-per-position.dto';

@Controller('value-per-position')
export class ValuePerPositionController {
  constructor(private readonly service: ValuePerPositionService) {}

  @Post()
  create(@Body() dto: CreateValuePerPositionDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateValuePerPositionDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
