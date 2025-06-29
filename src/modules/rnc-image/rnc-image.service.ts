import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RncImage } from './entities/rnc-image.entity';
import { NonConformity } from '../non-conformity/entities/non-conformity.entity';

@Injectable()
export class RncImageService {
  constructor(
    @InjectRepository(RncImage)
    private readonly rncImageRepository: Repository<RncImage>,

    @InjectRepository(NonConformity)
    private readonly nonConformityRepository: Repository<NonConformity>,
  ) {}

  async create(
    file: Express.Multer.File,
    nonConformityId: string,
    description: string = '', // Default description if not provided
  ): Promise<RncImage> {
    const nonConformity = await this.nonConformityRepository.findOneByOrFail({
      id: nonConformityId,
    });

    const image = this.rncImageRepository.create({
      url: `/files/${file.filename}`,
      nonConformityId: nonConformity,
      description: description, // You can modify this to include more details if needed
    });

    return this.rncImageRepository.save(image);
  }

  async findByNonConformity(nonConformityId: string): Promise<RncImage[]> {
    return this.rncImageRepository.find({
      where: { nonConformityId: { id: nonConformityId } },
    });
  }

  async remove(id: string): Promise<void> {
    await this.rncImageRepository.delete(id);
  }
}
