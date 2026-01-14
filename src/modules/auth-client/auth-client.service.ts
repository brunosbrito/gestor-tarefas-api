import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class AuthClientService {
  private readonly httpClient: AxiosInstance;

  constructor() {
    this.httpClient = axios.create({
      baseURL: process.env.AUTH_API_URL || 'http://localhost:3001',
      timeout: 5000,
    });
  }

  async validateToken(token: string) {
    try {
      const response = await this.httpClient.get('/auth/validate', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      if (error.response) {
        throw new HttpException(
          error.response.data.message || 'Token validation failed',
          error.response.status,
        );
      }
      throw new HttpException(
        'Auth service unavailable',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  async getUserById(userId: number, token: string) {
    try {
      const response = await this.httpClient.get(`/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      if (error.response) {
        throw new HttpException(
          error.response.data.message || 'User not found',
          error.response.status,
        );
      }
      throw new HttpException(
        'Auth service unavailable',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  async getAllUsers(token: string) {
    try {
      const response = await this.httpClient.get('/users', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      if (error.response) {
        throw new HttpException(
          error.response.data.message || 'Failed to fetch users',
          error.response.status,
        );
      }
      throw new HttpException(
        'Auth service unavailable',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  async healthCheck() {
    try {
      const response = await this.httpClient.get('/auth/health');
      return response.data;
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  }
}
