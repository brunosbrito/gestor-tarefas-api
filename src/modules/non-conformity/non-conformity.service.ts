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
  ) { }

  async create(dto: CreateNonConformityDto): Promise<NonConformity> {
    console.log('Creating NonConformity with DTO:', dto);
    const {
      responsibleIdentification,
      responsibleAction,
      serviceOrder,
      responsibleRnc,    // vem do DTO
      project,
      ...rest
    } = dto;

    const nonConformity = this.nonConformityRepository.create({
      ...rest,
      responsibleIdentification: responsibleIdentification
        ? { id: Number(responsibleIdentification) }
        : undefined,
      responsibleAction: responsibleAction
        ? { id: Number(responsibleAction) }
        : undefined,
      serviceOrder: serviceOrder
        ? { id: Number(serviceOrder) }
        : undefined,
      responsibleRNC: responsibleRnc     // note o “RNC” maiúsculo aqui
        ? { id: Number(responsibleRnc) }
        : undefined,
      project: project
        ? { id: Number(project) }
        : undefined,
    });

    return this.nonConformityRepository.save(nonConformity);
  }



  async findAll(): Promise<NonConformity[]> {
    return this.nonConformityRepository.find({
      relations: ['images', 'workforce', 'materials', 'responsibleIdentification',
        'responsibleAction', 'serviceOrder', 'responsibleRNC'],
    });
  }

  async findOne(id: string): Promise<NonConformity> {
    return this.nonConformityRepository.findOne({
      where: { id },
      relations: ['images', 'workforce', 'materials', 'responsibleIdentification',
        'responsibleAction', 'serviceOrder', 'responsibleRNC'],
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
