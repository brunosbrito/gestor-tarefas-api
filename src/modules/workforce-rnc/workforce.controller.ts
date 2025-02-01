import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { WorkforceService } from './workforce.service';
import { CreateWorkforceDto } from './dto/create-workforce.dto';
import { UpdateWorkforceDto } from './dto/update-workforce.dto';

@Controller('workforce')
export class WorkforceController {
  constructor(private readonly workforceService: WorkforceService) {}

  @Post()
  create(@Body() dto: CreateWorkforceDto) {
    return this.workforceService.create(dto);
  }

  @Get()
  findAll() {
    return this.workforceService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.workforceService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateWorkforceDto) {
    return this.workforceService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.workforceService.remove(id);
  }
}
