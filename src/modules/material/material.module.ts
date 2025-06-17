import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Material } from './entities/material.entity';
import { MaterialController } from './material.controller';
import { MaterialService } from './material.service';
import { NonConformityModule } from '../non-conformity/non-conformity.module';
import { NonConformity } from '../non-conformity/entities/non-conformity.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Material, NonConformity]),
    forwardRef(() => NonConformityModule),
  ],
  controllers: [MaterialController],
  providers: [MaterialService],
  exports: [MaterialService],
})
export class MaterialModule {}
