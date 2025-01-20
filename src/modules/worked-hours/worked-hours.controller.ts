import { Controller, Post, Body } from '@nestjs/common';
import { WorkedHoursService } from './worked-hours.service';
import { CreateWorkedHoursDto } from './dto/create-worked-hours.dto';
import { WorkedHours } from './entities/worked-hours.entity';

@Controller('worked-hours')
export class WorkedHoursController {
  constructor(private readonly workedHoursService: WorkedHoursService) {}

  @Post()
  async create(
    @Body() createWorkedHoursDto: CreateWorkedHoursDto,
  ): Promise<WorkedHours> {
    return this.workedHoursService.create(createWorkedHoursDto);
  }
}
