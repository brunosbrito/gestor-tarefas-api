import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RncImageService } from './rnc-image.service';
import { RncImageController } from './rnc-image.controller';
import { RncImage } from './entities/rnc-image.entity';
import { NonConformityModule } from '../non-conformity/non-conformity.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RncImage]),
    forwardRef(() => NonConformityModule),
  ],
  providers: [RncImageService],
  controllers: [RncImageController],
})
export class RncImageModule {}
