import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NonConformity } from './entities/non-conformity.entity';
import { CreateNonConformityDto } from './dto/create-non-conformity.dto';
import { UpdateNonConformityDto } from './dto/update-non-conformity.dto';

@Injectable()
export class NonConformityService {
  constructor(
    @InjectRepository(NonConformity)
    private readonly nonConformityRepository: Repository<NonConformity>,
  ) {}

  async create(dto: CreateNonConformityDto): Promise<NonConformity> {
    const nonConformity = this.nonConformityRepository.create(dto);
    return this.nonConformityRepository.save(nonConformity);
  }

  async findAll(): Promise<NonConformity[]> {
    return this.nonConformityRepository.find({
      relations: ['images', 'workforce', 'materials', 'serviceOrder'],
    });
  }

  async findOne(id: string): Promise<NonConformity> {
    return this.nonConformityRepository.findOne({
      where: { id },
      relations: ['images', 'workforce', 'materials'],
    });
  }

  async update(
    id: string,
    dto: UpdateNonConformityDto,
  ): Promise<NonConformity> {
    const nonConformity = await this.findOne(id);
    Object.assign(nonConformity, dto);
    return this.nonConformityRepository.save(nonConformity);
  }

  async remove(id: string): Promise<void> {
    await this.nonConformityRepository.delete(id);
  }
}
