import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  /**
   * Get dashboard summary
   * GET /analytics/dashboard
   */
  @Get('dashboard')
  async getDashboardSummary(
    @Query('userId') userId: string,
    @Query('month') month?: string,
    @Query('year') year?: string
  ) {
    if (!userId) {
      throw new BadRequestException('userId is required');
    }

    return await this.analyticsService.getDashboardSummary(
      userId,
      month ? parseInt(month) : undefined,
      year ? parseInt(year) : undefined
    );
  }

  /**
   * Get spending trend
   * GET /analytics/trend
   */
  @Get('trend')
  async getSpendingTrend(
    @Query('userId') userId: string,
    @Query('months') months: string = '6'
  ) {
    if (!userId) {
      throw new BadRequestException('userId is required');
    }

    return await this.analyticsService.getSpendingTrend(userId, parseInt(months));
  }

  /**
   * Get category analytics
   * GET /analytics/categories
   */
  @Get('categories')
  async getCategoryAnalytics(
    @Query('userId') userId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    if (!userId || !startDate || !endDate) {
      throw new BadRequestException('userId, startDate, and endDate are required');
    }

    return await this.analyticsService.getCategoryAnalytics(
      userId,
      new Date(startDate),
      new Date(endDate)
    );
  }

  /**
   * Get income vs expense
   * GET /analytics/income-vs-expense
   */
  @Get('income-vs-expense')
  async getIncomeVsExpense(
    @Query('userId') userId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    if (!userId || !startDate || !endDate) {
      throw new BadRequestException('userId, startDate, and endDate are required');
    }

    return await this.analyticsService.getIncomeVsExpense(
      userId,
      new Date(startDate),
      new Date(endDate)
    );
  }
}
