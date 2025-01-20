import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { ProcessService } from './process.service';
import { CreateProcessDto } from './dto/create-process.dto';
import { UpdateProcessDto } from './dto/update-process.do';

@Controller('process')
export class ProcessController {
  constructor(private readonly processService: ProcessService) {}

  @Post()
  create(@Body() createProcessDto: CreateProcessDto) {
    return this.processService.create(createProcessDto);
  }

  @Get()
  findAll() {
    return this.processService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.processService.findOne(+id);
  }

  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() updateMacroTaskDto: UpdateProcessDto,
  ) {
    return this.processService.update(+id, updateMacroTaskDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.processService.remove(+id);
  }
}
