import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Collaborator } from './entities/collaborator.entity';
import { CollaboratorService } from './collaborator.service';
import { CollaboratorController } from './collaborator.controller';
import { Team } from 'src/modules/team/entities/team.entity';
import { ValuePerPosition } from '../valuePerPosition/entity/value-per-position.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Collaborator, Team, ValuePerPosition])],
  controllers: [CollaboratorController],
  providers: [CollaboratorService],
})
export class CollaboratorModule {}
