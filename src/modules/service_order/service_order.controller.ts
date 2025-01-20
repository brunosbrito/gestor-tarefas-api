import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  NotFoundException,
  Patch,
} from '@nestjs/common';
import { ServiceOrderService } from './service_order.service';
import { ServiceOrder } from './entities/service_order.entity';

@Controller('service-orders')
export class ServiceOrderController {
  constructor(private readonly serviceOrderService: ServiceOrderService) {}

  @Post()
  async create(@Body() data: Partial<ServiceOrder>): Promise<ServiceOrder> {
    return this.serviceOrderService.create(data);
  }

  @Get()
  async findAll(): Promise<ServiceOrder[]> {
    return this.serviceOrderService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<ServiceOrder> {
    return this.serviceOrderService.findOne(id);
  }

  @Get('project/:id')
  async findByProjectId(@Param('id') id: number): Promise<ServiceOrder[]> {
    try {
      const serviceOrders = await this.serviceOrderService.findByProjectid(id);
      return serviceOrders;
    } catch (error) {
      // Se não encontrar nenhuma ordem de serviço, lançar exceção com mensagem personalizada
      throw new NotFoundException(
        `Não foram encontradas ordens de serviço para o projeto com id: ${id}, ${error}`,
      );
    }
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: Partial<ServiceOrder>,
  ): Promise<ServiceOrder> {
    return this.serviceOrderService.update(id, data);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.serviceOrderService.remove(id);
  }

  @Patch('/progress/:id')
  async updateProgress(
    @Param('id') id: number,
    @Body('progress') progress: number,
  ) {
    return this.serviceOrderService.updateProgress(id, progress);
  }
}
