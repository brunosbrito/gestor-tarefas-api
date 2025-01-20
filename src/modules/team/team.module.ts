import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Team } from './entities/team.entity';
import { TeamService } from './team.service';
import { TeamController } from './team.controller';
import { Collaborator } from '../collaborator/entities/collaborator.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Team, Collaborator])],
  controllers: [TeamController],
  providers: [TeamService],
})
export class TeamModule {}
