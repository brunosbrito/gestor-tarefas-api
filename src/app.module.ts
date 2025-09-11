import { forwardRef, Module } from '@nestjs/common';
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
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { NonConformityModule } from './modules/non-conformity/non-conformity.module';
import { ValuePerPositionModule } from './modules/valuePerPosition/value-per-position.module';
import { AuthClientModule } from './modules/auth-client/auth-client.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'files'), // Caminho para a pasta onde as imagens estão localizadas
      serveRoot: '/files/', // Prefixo para acessar as imagens
    }),
    ConfigModule.forRoot({
      envFilePath: '../.env', // Caminho do arquivo .env no container, ajuste conforme necessário
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      database: process.env.DB_DATABASE || 'db',
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'Digitalsegurogml2024!',
      synchronize: true, // Mantenha como true apenas em desenvolvimento
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
    NonConformityModule,
    ValuePerPositionModule,
    AuthClientModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
