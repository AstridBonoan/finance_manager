import { Controller, Get, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() body: { email: string; password: string }) {
    return this.authService.register(body.email, body.password);
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    // Will be implemented with Auth.js
    return { message: 'Login handled via Auth.js' };
  }

  @Get('profile')
  async getProfile() {
    // Will require JWT guard
    return { message: 'User profile endpoint' };
  }
}
