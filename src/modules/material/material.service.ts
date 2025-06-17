import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Material } from './entities/material.entity';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { NonConformity } from '../non-conformity/entities/non-conformity.entity';

@Injectable()
export class MaterialService {
  constructor(
    @InjectRepository(Material)
    private readonly materialRepository: Repository<Material>,

    @InjectRepository(NonConformity)
    private readonly nonConformityRepository: Repository<NonConformity>,
  ) {}

  async create(dto: CreateMaterialDto): Promise<Material> {
    const rnc = await this.nonConformityRepository.findOneBy({ id: dto.rncId });

    if (!rnc) throw new NotFoundException('RNC não encontrada.');

    const material = this.materialRepository.create({
      ...dto,
      nonConformity: rnc,
    });

    return this.materialRepository.save(material);
  }

  async findAll(): Promise<Material[]> {
    return this.materialRepository.find();
  }

  async findOne(id: string): Promise<Material> {
    return this.materialRepository.findOne({ where: { id } });
  }

  async findByRnc(rncId: string): Promise<Material[]> {
    const materials = await this.materialRepository.find({
      where: { nonConformity: { id: rncId } },
    });
    return materials;
  }

  async update(id: string, dto: UpdateMaterialDto): Promise<Material> {
    await this.materialRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.materialRepository.delete(id);
  }
}
