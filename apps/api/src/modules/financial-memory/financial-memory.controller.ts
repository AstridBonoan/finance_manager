import { Controller, Get, Post, Query, Param, UseGuards, BadRequestException } from '@nestjs/common';
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

  @Get('summary')
  async getMemorySummary(@CurrentUser() user: AuthenticatedUser) {
    const summary = await this.financialMemoryService.getMemorySummary(user.id);
    return { success: true, summary };
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

  @Post('refresh')
  async refreshMemory(@CurrentUser() user: AuthenticatedUser) {
    const result = await this.financialMemoryService.refreshMemory(user.id);
    return { success: true, ...result };
  }

  @Get('trends/categories')
  async getCategoryTrends(
    @CurrentUser() user: AuthenticatedUser,
    @Query('months') months: string = '6',
  ) {
    const trends = await this.financialMemoryService.getCategoryTrends(user.id, parseInt(months, 10));
    return { success: true, count: trends.length, trends };
  }

  @Post('trends/categories/generate')
  async generateCategoryTrends(
    @CurrentUser() user: AuthenticatedUser,
    @Query('months') months: string = '6',
  ) {
    const trends = await this.financialMemoryService.generateCategoryTrends(
      user.id,
      parseInt(months, 10),
    );
    return { success: true, count: trends.length, trends };
  }

  @Get('habits')
  async getHabits(@CurrentUser() user: AuthenticatedUser) {
    const habits = await this.financialMemoryService.getHabits(user.id);
    return { success: true, count: habits.length, habits };
  }

  @Post('anomalies/:id/review')
  async reviewAnomaly(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Query('feedback') feedback: 'normal' | 'flag' | 'ignore',
  ) {
    if (!['normal', 'flag', 'ignore'].includes(feedback)) {
      throw new BadRequestException('feedback must be one of: normal, flag, ignore');
    }
    const anomaly = await this.financialMemoryService.reviewAnomaly(user.id, id, feedback);
    return { success: true, anomaly };
  }
}

