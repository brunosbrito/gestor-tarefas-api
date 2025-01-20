import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { EffectiveService } from './effective.service';
import { CreateEffectiveDto } from './dto/create-effective.dto';
import { UpdateEffectiveDto } from './dto/update-effective.dto';
import { GetEffectiveDto } from './dto/get-effective.dto';

@Controller('effectives')
export class EffectiveController {
  constructor(private readonly effectiveService: EffectiveService) {}

  @Post()
  async create(
    @Body() createEffectiveDto: CreateEffectiveDto,
  ): Promise<GetEffectiveDto> {
    const effective = await this.effectiveService.create(createEffectiveDto);
    return effective;
  }

  @Get()
  async findAll(): Promise<GetEffectiveDto[]> {
    return this.effectiveService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<GetEffectiveDto> {
    return this.effectiveService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateEffectiveDto: UpdateEffectiveDto,
  ): Promise<GetEffectiveDto> {
    return this.effectiveService.update(id, updateEffectiveDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: number): Promise<void> {
    return this.effectiveService.remove(id);
  }

  @Get('by-shift-and-date/:shift')
  async findByShiftAndDate(@Param('shift') shift: number) {
    return this.effectiveService.findByShiftAndDate(shift);
  }
}
