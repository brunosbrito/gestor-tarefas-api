import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Team } from './entities/team.entity';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { Collaborator } from '../collaborator/entities/collaborator.entity';

@Injectable()
export class TeamService {
  constructor(
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
    @InjectRepository(Collaborator)
    private readonly collaboratorRepository: Repository<Collaborator>,
  ) {}

  async create(createTeamDto: CreateTeamDto): Promise<Team> {
    const { name, collaboratorIds } = createTeamDto;

    const collaborators = await this.collaboratorRepository.findBy({
      id: In(collaboratorIds),
    });

    if (collaborators.length !== collaboratorIds.length) {
      throw new NotFoundException('One or more collaborators not found');
    }

    const team = this.teamRepository.create({ name, collaborators });
    return this.teamRepository.save(team);
  }

  async findAll(): Promise<Team[]> {
    return this.teamRepository.find({ relations: ['collaborators'] });
  }

  async findOne(id: number): Promise<Team> {
    const team = await this.teamRepository.findOne({
      where: { id },
      relations: ['collaborators'],
    });

    if (!team) {
      throw new NotFoundException(`Team with ID ${id} not found`);
    }

    return team;
  }

  async update(id: number, updateTeamDto: UpdateTeamDto): Promise<Team> {
    const team = await this.findOne(id);

    if (updateTeamDto.collaboratorIds) {
      const collaborators = await this.collaboratorRepository.findByIds(
        updateTeamDto.collaboratorIds,
      );
      if (collaborators.length !== updateTeamDto.collaboratorIds.length) {
        throw new NotFoundException('One or more collaborators not found');
      }
      team.collaborators = collaborators;
    }

    Object.assign(team, updateTeamDto);
    return this.teamRepository.save(team);
  }

  async remove(id: number): Promise<void> {
    const team = await this.findOne(id);
    await this.teamRepository.remove(team);
  }
}
