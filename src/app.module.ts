import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { ProjectModule } from './modules/work/project.module';
import { ServiceOrderModule } from './modules/service_order/service_order.module';
import { CollaboratorModule } from './modules/collaborator/collaborator.module';
import { ActivitiesModule } from './modules/activities/activities.module';
import { TeamModule } from './modules/team/team.module';
import { ActivityHistoryModule } from './modules/activity-history/activity-history.module';
import { MacroTaskModule } from './modules/macro-task/macro-task.module';
import { ProcessModule } from './modules/processes/process.module';
import { EffectiveModule } from './modules/effective/effective.module';
import { ActivityImageModule } from './modules/activity-image/activity-image.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      database: process.env.DB_DATABASE,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      synchronize: true,
      entities: ['dist/**/*.entity.js'],
      migrations: ['src/migrations/*.ts'],
    }),
    AuthModule,
    UserModule,
    ProjectModule,
    ServiceOrderModule,
    CollaboratorModule,
    ActivitiesModule,
    TeamModule,
    forwardRef(() => ActivityHistoryModule),
    forwardRef(() => ActivityImageModule),
    MacroTaskModule,
    ProcessModule,
    EffectiveModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
