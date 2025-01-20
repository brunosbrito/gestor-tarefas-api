import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MacroTask } from './entities/macro-task.entity';
import { CreateMacroTaskDto } from './dto/create-macro-task.dto';
import { UpdateMacroTaskDto } from './dto/update-macro-task.dto';

@Injectable()
export class MacroTaskService {
  constructor(
    @InjectRepository(MacroTask)
    private readonly macroTaskRepository: Repository<MacroTask>,
  ) {}

  async create(createMacroTaskDto: CreateMacroTaskDto): Promise<MacroTask> {
    const newMacroTask = this.macroTaskRepository.create({
      ...createMacroTaskDto,
      createdAt: new Date(), // Adiciona a data automaticamente
    });
    return await this.macroTaskRepository.save(newMacroTask);
  }

  async findAll(): Promise<MacroTask[]> {
    return await this.macroTaskRepository.find();
  }

  async findOne(id: number): Promise<MacroTask> {
    const macroTask = await this.macroTaskRepository.findOne({ where: { id } });
    if (!macroTask) {
      throw new NotFoundException(`MacroTask with ID ${id} not found`);
    }
    return macroTask;
  }

  async update(
    id: number,
    updateMacroTaskDto: UpdateMacroTaskDto,
  ): Promise<MacroTask> {
    const macroTask = await this.findOne(id);
    const updatedTask = this.macroTaskRepository.merge(
      macroTask,
      updateMacroTaskDto,
    );
    return await this.macroTaskRepository.save(updatedTask);
  }

  async remove(id: number): Promise<void> {
    const macroTask = await this.findOne(id);
    await this.macroTaskRepository.remove(macroTask);
  }
}
