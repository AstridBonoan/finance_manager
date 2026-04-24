import { Controller, Get, Query, BadRequestException, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../auth/decorators/current-user.decorator';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  /**
   * Get dashboard summary
   * GET /analytics/dashboard
   */
  @Get('dashboard')
  async getDashboardSummary(
    @CurrentUser() user: AuthenticatedUser,
    @Query('month') month?: string,
    @Query('year') year?: string
  ) {
    return await this.analyticsService.getDashboardSummary(
      user.id,
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
    @CurrentUser() user: AuthenticatedUser,
    @Query('months') months: string = '6'
  ) {
    return await this.analyticsService.getSpendingTrend(user.id, parseInt(months));
  }

  /**
   * Get category analytics
   * GET /analytics/categories
   */
  @Get('categories')
  async getCategoryAnalytics(
    @CurrentUser() user: AuthenticatedUser,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    if (!startDate || !endDate) {
      throw new BadRequestException('startDate and endDate are required');
    }

    return await this.analyticsService.getCategoryAnalytics(
      user.id,
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
    @CurrentUser() user: AuthenticatedUser,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    if (!startDate || !endDate) {
      throw new BadRequestException('startDate and endDate are required');
    }

    return await this.analyticsService.getIncomeVsExpense(
      user.id,
      new Date(startDate),
      new Date(endDate)
    );
  }
}
