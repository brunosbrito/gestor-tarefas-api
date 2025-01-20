import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Process } from './entities/process.entity';
import { CreateProcessDto } from './dto/create-process.dto';
import { UpdateProcessDto } from './dto/update-process.do';

@Injectable()
export class ProcessService {
  constructor(
    @InjectRepository(Process)
    private readonly processRepository: Repository<Process>,
  ) {}

  async create(createProcessDto: CreateProcessDto): Promise<Process> {
    const newProcess = this.processRepository.create({
      ...createProcessDto,
      createdAt: new Date(),
    });
    return await this.processRepository.save(newProcess);
  }

  async findAll(): Promise<Process[]> {
    return await this.processRepository.find();
  }

  async findOne(id: number): Promise<Process> {
    const process = await this.processRepository.findOne({ where: { id } });
    if (!process) {
      throw new NotFoundException(`Process with ID ${id} not found`);
    }
    return process;
  }

  async update(
    id: number,
    updateProcessDto: UpdateProcessDto,
  ): Promise<Process> {
    const process = await this.findOne(id);
    const updatedProcess = this.processRepository.merge(
      process,
      updateProcessDto,
    );
    return await this.processRepository.save(updatedProcess);
  }

  async remove(id: number): Promise<void> {
    const process = await this.findOne(id);
    await this.processRepository.remove(process);
  }
}
