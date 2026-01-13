import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthClientService } from './auth-client.service';

@Injectable()
export class ExternalJwtAuthGuard implements CanActivate {
  constructor(private authClientService: AuthClientService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('No token provided');
    }

    const token = authHeader.replace('Bearer ', '');

    try {
      const validationResult = await this.authClientService.validateToken(token);
      
      if (!validationResult.valid) {
        throw new UnauthorizedException(validationResult.error || 'Invalid token');
      }

      // Adiciona as informações do usuário ao request
      request.user = validationResult.user;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Token validation failed');
    }
  }
}