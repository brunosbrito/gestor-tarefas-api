// src/modules/project/project.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { Project } from './entities/project.entity';

@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  // Criar projeto
  @Post()
  async create(@Body() projectData: Partial<Project>): Promise<Project> {
    return this.projectService.create(projectData);
  }

  // Buscar todos os projetos
  @Get()
  async findAll(): Promise<Project[]> {
    return this.projectService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Project> {
    return this.projectService.findOne(id);
  }

  // Atualizar projeto
  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() projectData: Partial<Project>,
  ): Promise<Project> {
    return this.projectService.update(id, projectData);
  }

  // Deletar projeto
  @Delete(':id')
  async remove(@Param('id') id: number): Promise<void> {
    return this.projectService.remove(id);
  }
}
