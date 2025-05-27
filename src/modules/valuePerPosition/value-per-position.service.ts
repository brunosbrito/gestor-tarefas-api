import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateValuePerPositionDto } from './dto/create-value-per-position.dto';
import { UpdateValuePerPositionDto } from './dto/update-value-per-position.dto';
import { ValuePerPosition } from './entity/value-per-position.entity';

@Injectable()
export class ValuePerPositionService {
  constructor(
    @InjectRepository(ValuePerPosition)
    private readonly repo: Repository<ValuePerPosition>,
  ) {}

  create(dto: CreateValuePerPositionDto) {
    const valuePerPosition = this.repo.create(dto);
    return this.repo.save(valuePerPosition);
  }

  findAll() {
    return this.repo.find();
  }

  findOne(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  async update(id: number, dto: UpdateValuePerPositionDto) {
    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.repo.delete(id);
    return { deleted: true };
  }
}
