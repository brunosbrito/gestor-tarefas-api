import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceOrder } from './entities/service_order.entity';

@Injectable()
export class ServiceOrderService {
  constructor(
    @InjectRepository(ServiceOrder)
    private readonly serviceOrderRepository: Repository<ServiceOrder>,
  ) {}

  async create(data: Partial<ServiceOrder>): Promise<ServiceOrder> {
    const lastServiceOrder = await this.serviceOrderRepository
      .createQueryBuilder('serviceOrder') // 'serviceOrder' é o alias da tabela
      .where('serviceOrder.projectId = :projectId', {
        projectId: data.projectId,
      })
      .orderBy('serviceOrder.serviceOrderNumber', 'DESC')
      .getOne();

    // Calcula o próximo número da ordem de serviço
    const nextServiceOrderNumber = lastServiceOrder
      ? lastServiceOrder.serviceOrderNumber + 1
      : 1;

    const serviceOrder = this.serviceOrderRepository.create({
      ...data,
      serviceOrderNumber: nextServiceOrderNumber,
    });

    return this.serviceOrderRepository.save(serviceOrder);
  }

  async findAll(): Promise<ServiceOrder[]> {
    return this.serviceOrderRepository.find({
      relations: ['projectId', 'assignedUser'],
    });
  }

  async findOne(id: number): Promise<ServiceOrder> {
    const serviceOrder = await this.serviceOrderRepository.findOne({
      where: { id },
      relations: ['projectId', 'assignedUser'],
    });
    if (!serviceOrder) {
      throw new NotFoundException(`Service Order with ID ${id} not found`);
    }
    return serviceOrder;
  }

  async findByProjectid(id: number): Promise<ServiceOrder[]> {
    const serviceOrders = await this.serviceOrderRepository.find({
      where: {
        projectId: { id: id },
      },
      relations: ['projectId', 'assignedUser', 'activities'],
      order: { serviceOrderNumber: 'ASC' },
    });

    if (!serviceOrders || serviceOrders.length === 0) {
      throw new Error(`Service Order not found for project id: ${id}`);
    }
    return serviceOrders;
  }

  async update(id: number, data: Partial<ServiceOrder>): Promise<ServiceOrder> {
    const serviceOrder = await this.findOne(id);
    Object.assign(serviceOrder, data);
    return this.serviceOrderRepository.save(serviceOrder);
  }

  async remove(id: number): Promise<void> {
    const serviceOrder = await this.serviceOrderRepository.findOne({
      where: { id },
      relations: [
        'activities',
        'activities.history',
        'activities.images',
        'activities.workedHours',
        'nonConformities',
      ],
    });

    if (!serviceOrder) {
      throw new NotFoundException('Ordem de serviço não encontrada.');
    }

    await this.serviceOrderRepository.remove(serviceOrder);
  }

  async updateProgress(id: number, progress: number): Promise<ServiceOrder> {
    const serviceOrder = await this.serviceOrderRepository.findOne({
      where: { id },
    });

    if (!serviceOrder) {
      throw new Error('ServiceOrder not found');
    }

    serviceOrder.progress = progress;

    return this.serviceOrderRepository.save(serviceOrder);
  }
}
