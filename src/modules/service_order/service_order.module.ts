import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceOrder } from './entities/service_order.entity';
import { ServiceOrderController } from './service_order.controller';
import { ServiceOrderService } from './service_order.service';

@Module({
  imports: [TypeOrmModule.forFeature([ServiceOrder])],
  controllers: [ServiceOrderController],
  providers: [ServiceOrderService],
})
export class ServiceOrderModule {}
