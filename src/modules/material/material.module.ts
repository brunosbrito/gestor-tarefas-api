import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Material } from './entities/material.entity';
import { MaterialController } from './material.controller';
import { MaterialService } from './material.service';
import { NonConformityModule } from '../non-conformity/non-conformity.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Material]),
    forwardRef(() => NonConformityModule),
  ],
  controllers: [MaterialController],
  providers: [MaterialService],
  exports: [MaterialService],
})
export class MaterialModule {}
