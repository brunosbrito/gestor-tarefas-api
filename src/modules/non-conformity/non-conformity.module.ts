import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NonConformity } from './entities/non-conformity.entity';
import { NonConformityController } from './non-conformity.controller';
import { NonConformityService } from './non-conformity.service';
import { RncImageModule } from '../rnc-image/rnc-image.module';
import { WorkforceModule } from '../workforce-rnc/workforce.module';
import { MaterialModule } from '../material/material.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([NonConformity]),
    RncImageModule,
    WorkforceModule,
    MaterialModule,
  ],
  controllers: [NonConformityController],
  providers: [NonConformityService],
  exports: [NonConformityService],
})
export class NonConformityModule {}
