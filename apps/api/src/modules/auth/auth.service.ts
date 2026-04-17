import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async validateUser(userId: string) {
    // Implementation in Sprint 1 completion
    return { userId };
  }

  async login(user: any) {
    const payload = { sub: user.id, email: user.email };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(email: string, password: string) {
    // Implementation in Sprint 1 completion
    // Will use Auth.js/NextAuth in frontend
    return { message: 'Registration handled via Auth.js' };
  }
}
