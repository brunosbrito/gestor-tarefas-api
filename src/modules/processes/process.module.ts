import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Process } from './entities/process.entity';
import { ProcessService } from './process.service';
import { ProcessController } from './process.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Process])],
  controllers: [ProcessController],
  providers: [ProcessService],
  exports: [ProcessService],
})
export class ProcessModule {}
