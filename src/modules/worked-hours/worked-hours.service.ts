import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkedHours } from './entities/worked-hours.entity';
import { CreateWorkedHoursDto } from './dto/create-worked-hours.dto';

@Injectable()
export class WorkedHoursService {
  constructor(
    @InjectRepository(WorkedHours)
    private workedHoursRepository: Repository<WorkedHours>,
  ) {}

  async create(
    createWorkedHoursDto: CreateWorkedHoursDto,
  ): Promise<WorkedHours> {
    const { colaboradorId, atividadeId, hoursWorked, date } =
      createWorkedHoursDto;

    const workedHours = this.workedHoursRepository.create({
      colaborador: { id: colaboradorId },
      atividade: { id: atividadeId },
      hoursWorked,
      date,
    });

    return this.workedHoursRepository.save(workedHours);
  }
}
