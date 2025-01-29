// src/modules/project/project.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  // Criar novo projeto
  async create(projectData: Partial<Project>): Promise<Project> {
    const project = this.projectRepository.create(projectData);
    return this.projectRepository.save(project);
  }

  // Buscar todos os projetos
  async findAll(): Promise<Project[]> {
    return this.projectRepository.find();
  }

  // Buscar projeto por ID
  async findOne(id: number): Promise<Project> {
    return this.projectRepository.findOne({ where: { id } });
  }

  // Atualizar projeto
  async update(id: number, projectData: Partial<Project>): Promise<Project> {
    await this.projectRepository.update(id, projectData);
    return this.projectRepository.findOne({ where: { id } });
  }

  // Deletar projeto
  async remove(id: number): Promise<void> {
    await this.projectRepository.delete(id);
  }

  async findByType(type: string): Promise<Project[]> {
    return this.projectRepository.find({ where: { type } });
  }
}
