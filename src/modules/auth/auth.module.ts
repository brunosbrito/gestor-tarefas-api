// src/modules/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { ApiKey } from './entities/api-key.entity';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ApiKeyController } from './api-key.controller';
import { ApiKeyService } from './api-key.service';
import { JwtStrategy } from './jwt.strategy';
import { ApiKeyGuard } from './api-key.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, RefreshToken, ApiKey]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secretKey',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [AuthController, ApiKeyController],
  providers: [AuthService, ApiKeyService, JwtStrategy, ApiKeyGuard],
  exports: [AuthService, ApiKeyService, ApiKeyGuard],
})
export class AuthModule {}
