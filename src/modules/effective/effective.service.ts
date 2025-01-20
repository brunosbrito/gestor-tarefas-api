import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { CreateEffectiveDto } from './dto/create-effective.dto';
import { UpdateEffectiveDto } from './dto/update-effective.dto';
import { Effective } from './entities/effective.entity';
import { GetEffectiveDto } from './dto/get-effective.dto';

@Injectable()
export class EffectiveService {
  constructor(
    @InjectRepository(Effective)
    private effectiveRepository: Repository<Effective>,
  ) {}

  async create(createEffectiveDto: CreateEffectiveDto): Promise<Effective> {
    const effective = this.effectiveRepository.create(createEffectiveDto);
    return await this.effectiveRepository.save(effective);
  }

  async update(
    id: number,
    updateEffectiveDto: UpdateEffectiveDto,
  ): Promise<Effective> {
    const effective = await this.effectiveRepository.findOne({ where: { id } });

    if (!effective) {
      throw new NotFoundException(
        `Ponto de trabalho com ID ${id} não encontrado.`,
      );
    }

    Object.assign(effective, updateEffectiveDto);

    return await this.effectiveRepository.save(effective);
  }

  async findAll(): Promise<GetEffectiveDto[]> {
    const effectives = await this.effectiveRepository.find();
    return effectives;
  }

  async findOne(id: number): Promise<GetEffectiveDto> {
    const effective = await this.effectiveRepository.findOne({ where: { id } });

    if (!effective) {
      throw new NotFoundException(
        `Ponto de trabalho com ID ${id} não encontrado.`,
      );
    }

    return effective;
  }

  async remove(id: number): Promise<void> {
    const effective = await this.effectiveRepository.findOne({ where: { id } });

    if (!effective) {
      throw new NotFoundException(
        `Ponto de trabalho com ID ${id} não encontrado.`,
      );
    }

    await this.effectiveRepository.remove(effective);
  }

  async findByShiftAndDate(shift: number): Promise<GetEffectiveDto[]> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    const effectives = await this.effectiveRepository.find({
      where: {
        shift: shift,
        createdAt: Between(startOfDay, endOfDay),
      },
    });
    return effectives;
  }
}
