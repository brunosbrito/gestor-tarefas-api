// src/modules/auth/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  //@UseGuards(JwtAuthGuard)
  async register(
    @Body()
    userData: {
      username: string;
      email: string;
      password: string;
      role: string;
    },
  ) {
    const { username, email, password, role } = userData;
    const user = await this.authService.createUser(
      username,
      email,
      password,
      role,
    );
    return { message: 'Novo usuário criado', user };
  }

  @Post('login')
  async login(@Body() userData: { email: string; password: string }) {
    const { email, password } = userData;

    const user = await this.authService.validateUser(email, password);
    if (!user) {
      return { message: 'Credenciais inválidas' };
    }
    const tokens = await this.authService.login(user);
    return tokens;
  }

  @Post('refresh')
  async refresh(@Body() body: { refresh_token: string }) {
    const { refresh_token } = body;

    if (!refresh_token) {
      throw new UnauthorizedException('Refresh token não fornecido');
    }

    try {
      const result = await this.authService.refreshAccessToken(refresh_token);
      return result;
    } catch (error) {
      throw new UnauthorizedException(error.message || 'Falha ao renovar token');
    }
  }

  @Post('logout')
  async logout(@Body() body: { refresh_token: string }) {
    const { refresh_token } = body;

    if (refresh_token) {
      await this.authService.revokeRefreshToken(refresh_token);
    }

    return { message: 'Logout realizado com sucesso' };
  }
}
