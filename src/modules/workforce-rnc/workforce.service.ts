import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workforce } from './entities/workforce.entity';
import { CreateWorkforceDto } from './dto/create-workforce.dto';
import { NonConformity } from '../non-conformity/entities/non-conformity.entity';

@Injectable()
export class WorkforceService {
  constructor(
    @InjectRepository(Workforce)
    private readonly workforceRepository: Repository<Workforce>,

    @InjectRepository(NonConformity)
    private readonly nonConformityRepository: Repository<NonConformity>,
  ) {}

  async create(dto: CreateWorkforceDto): Promise<Workforce> {
    const nonConformity = await this.nonConformityRepository.findOneBy({
      id: dto.rnc,
    });

    if (!nonConformity) {
      throw new Error(`RNC com id ${dto.rnc} não encontrada`);
    }

    const newWorkforce = this.workforceRepository.create({
      colaboradorId: dto.colaboradorId,
      name: dto.name,
      hours: dto.hours,
      valueHour: dto.valueHour,
      total: dto.total,
      nonConformity,
    });

    return this.workforceRepository.save(newWorkforce);
  }

  async findAll(): Promise<Workforce[]> {
    return this.workforceRepository.find({
      relations: ['nonConformity'],
    });
  }

  async findByRnc(rncId: string): Promise<Workforce[]> {
    const data = await this.workforceRepository.find({
      where: { nonConformity: { id: rncId } },
      relations: ['nonConformity'],
    });
    console.log('Workforce data:', data);
    return data;
  }

  // async update(id: string, dto: UpdateWorkforceDto): Promise<Workforce> {
  //   await this.workforceRepository.update(id, dto);
  //   return this.findOne(id);
  // }

  async remove(id: string): Promise<void> {
    await this.workforceRepository.delete(id);
  }
}
