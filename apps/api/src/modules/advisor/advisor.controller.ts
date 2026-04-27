import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../auth/decorators/current-user.decorator';
import { AdvisorService } from './advisor.service';

@Controller('advisor')
@UseGuards(JwtAuthGuard)
export class AdvisorController {
  constructor(private readonly advisorService: AdvisorService) {}

  @Get('insights')
  async getInsights(@CurrentUser() user: AuthenticatedUser) {
    const data = await this.advisorService.getInsights(user.id);
    return { success: true, ...data };
  }

  @Post('chat')
  async chat(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: { message: string },
  ) {
    const data = await this.advisorService.chat(user.id, body.message || '');
    return { success: true, ...data };
  }
}

