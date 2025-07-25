import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Collaborator } from './entities/collaborator.entity';
import { CreateCollaboratorDto } from './dto/create-collaborator.dto';
import { UpdateCollaboratorDto } from './dto/update-collaborator.dto';
import { Team } from 'src/modules/team/entities/team.entity';

@Injectable()
export class CollaboratorService {
  constructor(
    @InjectRepository(Collaborator)
    private readonly collaboratorRepository: Repository<Collaborator>,
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
  ) {}

  async create(
    createCollaboratorDto: CreateCollaboratorDto,
  ): Promise<Collaborator> {
    const collaborator = this.collaboratorRepository.create(
      createCollaboratorDto,
    );
    return this.collaboratorRepository.save(collaborator);
  }

  async findAll(): Promise<Collaborator[]> {
    return this.collaboratorRepository.find({
      relations: ['team', 'position'],
    });
  }

  async findOne(id: number): Promise<Collaborator> {
    const collaborator = await this.collaboratorRepository.findOne({
      where: { id },
      relations: ['team', 'position'],
    });

    if (!collaborator) {
      throw new NotFoundException(`Collaborator with ID ${id} not found`);
    }

    return collaborator;
  }

  async update(
    id: number,
    updateCollaboratorDto: UpdateCollaboratorDto,
  ): Promise<Collaborator> {
    const collaborator = await this.findOne(id);

    Object.assign(collaborator, updateCollaboratorDto);
    return this.collaboratorRepository.save(collaborator);
  }

  async remove(id: number): Promise<void> {
    const collaborator = await this.findOne(id);
    await this.collaboratorRepository.remove(collaborator);
  }

  async updateStatus(id: number, status: boolean) {
    const collaborator = await this.collaboratorRepository.findOne({
      where: { id },
    });

    if (!collaborator) {
      throw new NotFoundException('Colaborador não encontrado');
    }

    collaborator.status = status;

    return this.collaboratorRepository.save(collaborator);
  }
}
