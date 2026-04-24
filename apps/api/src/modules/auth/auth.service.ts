import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient } from '@finance-app/db';
import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';

const prisma = new PrismaClient();

interface JwtUserPayload {
  sub: string;
  email: string;
}

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async validateUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true },
    });
    return user || null;
  }

  private hashPassword(password: string): string {
    const salt = randomBytes(16).toString('hex');
    const derived = scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${derived}`;
  }

  private verifyPassword(password: string, storedHash: string): boolean {
    const [salt, key] = storedHash.split(':');
    if (!salt || !key) {
      return false;
    }
    const derived = scryptSync(password, salt, 64);
    const storedKey = Buffer.from(key, 'hex');
    if (storedKey.length !== derived.length) {
      return false;
    }
    return timingSafeEqual(storedKey, derived);
  }

  private signToken(payload: JwtUserPayload): string {
    return this.jwtService.sign(payload);
  }

  async login(email: string, password: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, email: true, passwordHash: true },
    });

    if (!user || !user.passwordHash || !this.verifyPassword(password, user.passwordHash)) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtUserPayload = { sub: user.id, email: user.email };
    return {
      access_token: this.signToken(payload),
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }

  async register(email: string, password: string) {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password || password.length < 8) {
      throw new BadRequestException('Email and password (min 8 chars) are required');
    }

    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    });
    if (existing) {
      throw new ConflictException('Email is already registered');
    }

    const created = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash: this.hashPassword(password),
      },
      select: { id: true, email: true },
    });

    const payload: JwtUserPayload = { sub: created.id, email: created.email };
    return {
      access_token: this.signToken(payload),
      user: created,
    };
  }
}
