import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { AllocationsService, AllocationRule, AllocationResult } from './allocations.service';

@Controller('allocations')
export class AllocationsController {
  constructor(private readonly allocationsService: AllocationsService) {}

  /**
   * POST /allocations/rules?budgetId=xxx&userId=xxx
   * Set allocation rules for a budget
   */
  @Post('rules')
  async setAllocationRules(
    @Query('budgetId') budgetId: string,
    @Query('userId') userId: string,
    @Body() dto: { rules: AllocationRule[] },
  ): Promise<AllocationRule[]> {
    return this.allocationsService.setAllocationRules(budgetId, userId, dto.rules);
  }

  /**
   * GET /allocations/calculate?budgetId=xxx&userId=xxx
   * Calculate allocation for a budget
   */
  @Get('calculate')
  async calculateAllocation(
    @Query('budgetId') budgetId: string,
    @Query('userId') userId: string,
  ): Promise<AllocationResult[]> {
    return this.allocationsService.calculateAllocation(budgetId, userId);
  }

  /**
   * GET /allocations/recommendations?userId=xxx
   * Get allocation recommendations based on spending
   */
  @Get('recommendations')
  async getRecommendations(@Query('userId') userId: string): Promise<AllocationResult[]> {
    return this.allocationsService.getRecommendations(userId);
  }

  /**
   * GET /allocations/usage?budgetId=xxx&userId=xxx
   * Get current allocation usage
   */
  @Get('usage')
  async getAllocationUsage(
    @Query('budgetId') budgetId: string,
    @Query('userId') userId: string,
  ): Promise<AllocationResult[]> {
    return this.allocationsService.getAllocationUsage(budgetId, userId);
  }
}
