import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workforce } from './entities/workforce.entity';
import { CreateWorkforceDto } from './dto/create-workforce.dto';
import { UpdateWorkforceDto } from './dto/update-workforce.dto';

@Injectable()
export class WorkforceService {
  constructor(
    @InjectRepository(Workforce)
    private readonly workforceRepository: Repository<Workforce>,
  ) {}

  async create(dto: CreateWorkforceDto): Promise<Workforce> {
    const workforce = this.workforceRepository.create(dto);
    return this.workforceRepository.save(workforce);
  }

  async findAll(): Promise<Workforce[]> {
    return this.workforceRepository.find();
  }

  async findOne(id: string): Promise<Workforce> {
    return this.workforceRepository.findOne({ where: { id } });
  }

  async update(id: string, dto: UpdateWorkforceDto): Promise<Workforce> {
    await this.workforceRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.workforceRepository.delete(id);
  }
}
