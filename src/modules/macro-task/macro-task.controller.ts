import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { MacroTaskService } from './macro-task.service';
import { CreateMacroTaskDto } from './dto/create-macro-task.dto';
import { UpdateMacroTaskDto } from './dto/update-macro-task.dto';

@Controller('macro-tasks')
export class MacroTaskController {
  constructor(private readonly macroTaskService: MacroTaskService) {}

  @Post()
  create(@Body() createMacroTaskDto: CreateMacroTaskDto) {
    return this.macroTaskService.create(createMacroTaskDto);
  }

  @Get()
  findAll() {
    return this.macroTaskService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.macroTaskService.findOne(+id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateMacroTaskDto: UpdateMacroTaskDto,
  ) {
    return this.macroTaskService.update(+id, updateMacroTaskDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.macroTaskService.remove(+id);
  }
}
