import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { FinancialMemoryService } from './financial-memory.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../auth/decorators/current-user.decorator';

@Controller('financial-memory')
@UseGuards(JwtAuthGuard)
export class FinancialMemoryController {
  constructor(private readonly financialMemoryService: FinancialMemoryService) {}

  @Post('baselines/recalculate')
  async recalculateBaselines(@CurrentUser() user: AuthenticatedUser) {
    const baselines = await this.financialMemoryService.recalculateBaselines(user.id);
    return { success: true, count: baselines.length, baselines };
  }

  @Get('baselines')
  async getBaselines(@CurrentUser() user: AuthenticatedUser) {
    const baselines = await this.financialMemoryService.getBaselines(user.id);
    return { success: true, baselines };
  }

  @Get('trends')
  async getTrends(
    @CurrentUser() user: AuthenticatedUser,
    @Query('months') months: string = '6',
  ) {
    const trends = await this.financialMemoryService.getTrends(user.id, parseInt(months, 10));
    return { success: true, trends };
  }

  @Get('anomalies')
  async getAnomalies(@CurrentUser() user: AuthenticatedUser) {
    const anomalies = await this.financialMemoryService.getAnomalies(user.id);
    return { success: true, anomalies };
  }

  @Post('trends/generate')
  async generateTrends(
    @CurrentUser() user: AuthenticatedUser,
    @Query('months') months: string = '6',
  ) {
    const trends = await this.financialMemoryService.generateSpendingTrends(
      user.id,
      parseInt(months, 10),
    );
    return { success: true, count: trends.length, trends };
  }

  @Post('anomalies/detect')
  async detectAnomalies(@CurrentUser() user: AuthenticatedUser) {
    const anomalies = await this.financialMemoryService.detectAnomalies(user.id);
    return { success: true, count: anomalies.length, anomalies };
  }
}

