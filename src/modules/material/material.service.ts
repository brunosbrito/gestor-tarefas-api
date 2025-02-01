import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Material } from './entities/material.entity';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';

@Injectable()
export class MaterialService {
  constructor(
    @InjectRepository(Material)
    private readonly materialRepository: Repository<Material>,
  ) {}

  async create(dto: CreateMaterialDto): Promise<Material> {
    const material = this.materialRepository.create(dto);
    return this.materialRepository.save(material);
  }

  async findAll(): Promise<Material[]> {
    return this.materialRepository.find();
  }

  async findOne(id: string): Promise<Material> {
    return this.materialRepository.findOne({ where: { id } });
  }

  async update(id: string, dto: UpdateMaterialDto): Promise<Material> {
    await this.materialRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.materialRepository.delete(id);
  }
}
