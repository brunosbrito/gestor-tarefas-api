import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateActivityHistoryDto } from './dto/create-activity-history.dto';
import { User } from 'src/modules/user/entities/user.entity';
import { ActivityHistory } from './entities/activity-history.entity';
import { Activity } from '../activities/entities/activities.entity';

@Injectable()
export class ActivityHistoryService {
  constructor(
    @InjectRepository(ActivityHistory)
    private readonly activityHistoryRepository: Repository<ActivityHistory>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>, // Repositório de usuários
    @InjectRepository(Activity)
    private readonly activityRepository: Repository<Activity>, // Repositório de atividades
  ) {}

  async createHistory(
    createActivityHistoryDto: CreateActivityHistoryDto,
    userId: number,
  ): Promise<ActivityHistory> {
    const { activityId, status, description, DayQuantity } =
      createActivityHistoryDto;

    const activity = await this.activityRepository.findOne({
      where: { id: activityId },
    });
    if (!activity) {
      throw new NotFoundException('Activity not found');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const activityHistory = this.activityHistoryRepository.create({
      activity,
      status,
      description,
      changedBy: user,
      DayQuantity: DayQuantity || null,
    });

    return this.activityHistoryRepository.save(activityHistory);
  }

  findHistoryByActivity(activityId: number): Promise<ActivityHistory[]> {
    return this.activityHistoryRepository.find({
      where: { activity: { id: activityId } },
      relations: ['changedBy'],
      order: { timestamp: 'ASC' },
    });
  }
}
