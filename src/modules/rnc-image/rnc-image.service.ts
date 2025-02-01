import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RncImage } from './entities/rnc-image.entity';
import { CreateRncImageDto } from './dto/create-rnc-image.dto';

@Injectable()
export class RncImageService {
  constructor(
    @InjectRepository(RncImage)
    private readonly rncImageRepository: Repository<RncImage>,
  ) {}

  async create(dto: CreateRncImageDto): Promise<RncImage> {
    const image = this.rncImageRepository.create(dto);
    return this.rncImageRepository.save(image);
  }

  async findByNonConformity(nonConformityId: string): Promise<RncImage[]> {
    return this.rncImageRepository.find({
      where: { nonConformity: { id: nonConformityId } },
    });
  }

  async remove(id: string): Promise<void> {
    await this.rncImageRepository.delete(id);
  }
}
