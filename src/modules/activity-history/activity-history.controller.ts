import { Controller, Post, Body, Param, Get } from '@nestjs/common';
import { ActivityHistoryService } from './activity-history.service';
import { CreateActivityHistoryDto } from './dto/create-activity-history.dto';
import { ActivityHistory } from './entities/activity-history.entity';

@Controller('activity-history')
export class ActivityHistoryController {
  constructor(
    private readonly activityHistoryService: ActivityHistoryService,
  ) {}

  @Post(':userId')
  async create(
    @Param('userId') userId: number, // Obtendo o userId da URL
    @Body() createActivityHistoryDto: CreateActivityHistoryDto,
  ): Promise<ActivityHistory> {
    return this.activityHistoryService.createHistory(
      createActivityHistoryDto,
      userId,
    );
  }

  @Get(':activityId')
  async findHistoryByActivity(
    @Param('activityId') activityId: number,
  ): Promise<ActivityHistory[]> {
    return this.activityHistoryService.findHistoryByActivity(activityId);
  }
}
