import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { AllocationsService, AllocationRule, AllocationResult } from './allocations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../auth/decorators/current-user.decorator';

@Controller('allocations')
@UseGuards(JwtAuthGuard)
export class AllocationsController {
  constructor(private readonly allocationsService: AllocationsService) {}

  /**
   * POST /allocations/rules?budgetId=xxx&userId=xxx
   * Set allocation rules for a budget
   */
  @Post('rules')
  async setAllocationRules(
    @Query('budgetId') budgetId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: { rules: AllocationRule[] },
  ): Promise<AllocationRule[]> {
    return this.allocationsService.setAllocationRules(budgetId, user.id, dto.rules);
  }

  /**
   * GET /allocations/calculate?budgetId=xxx&userId=xxx
   * Calculate allocation for a budget
   */
  @Get('calculate')
  async calculateAllocation(
    @Query('budgetId') budgetId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<AllocationResult[]> {
    return this.allocationsService.calculateAllocation(budgetId, user.id);
  }

  /**
   * GET /allocations/recommendations?userId=xxx
   * Get allocation recommendations based on spending
   */
  @Get('recommendations')
  async getRecommendations(@CurrentUser() user: AuthenticatedUser): Promise<AllocationResult[]> {
    return this.allocationsService.getRecommendations(user.id);
  }

  /**
   * GET /allocations/usage?budgetId=xxx&userId=xxx
   * Get current allocation usage
   */
  @Get('usage')
  async getAllocationUsage(
    @Query('budgetId') budgetId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<AllocationResult[]> {
    return this.allocationsService.getAllocationUsage(budgetId, user.id);
  }
}
