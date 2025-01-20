// src/modules/auth/auth.controller.ts
import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @UseGuards(JwtAuthGuard)
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
}
