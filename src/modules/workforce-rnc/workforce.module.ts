import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Workforce } from './entities/workforce.entity';
import { WorkforceController } from './workforce.controller';
import { WorkforceService } from './workforce.service';
import { NonConformity } from '../non-conformity/entities/non-conformity.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Workforce, NonConformity])],
  controllers: [WorkforceController],
  providers: [WorkforceService],
  exports: [WorkforceService],
})
export class WorkforceModule {}
