import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
} from '@nestjs/common';
import { BudgetsService, CreateBudgetDto, UpdateBudgetDto, BudgetProgress } from './budgets.service';

@Controller('budgets')
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  /**
   * POST /budgets
   * Create a new budget allocation
   */
  @Post()
  async createBudget(@Body() createBudgetDto: CreateBudgetDto) {
    return this.budgetsService.createBudget(createBudgetDto);
  }

  /**
   * GET /budgets?budgetId=xxx&userId=xxx
   * List all allocations for a budget
   */
  @Get()
  async listBudgets(
    @Query('budgetId') budgetId: string,
    @Query('userId') userId: string,
  ): Promise<BudgetProgress[]> {
    return this.budgetsService.listBudgets(budgetId, userId);
  }

  /**
   * GET /budgets/summary?budgetId=xxx&userId=xxx
   * Get budget summary
   */
  @Get('summary')
  async getBudgetSummary(
    @Query('budgetId') budgetId: string,
    @Query('userId') userId: string,
  ) {
    return this.budgetsService.getBudgetSummary(budgetId, userId);
  }

  /**
   * GET /budgets/:id?userId=xxx
   * Get single allocation with progress
   */
  @Get(':id')
  async getBudget(
    @Param('id') allocationId: string,
    @Query('userId') userId: string,
  ): Promise<BudgetProgress> {
    return this.budgetsService.getBudget(allocationId, userId);
  }

  /**
   * PATCH /budgets/:id?userId=xxx
   * Update a budget allocation
   */
  @Patch(':id')
  async updateBudget(
    @Param('id') allocationId: string,
    @Query('userId') userId: string,
    @Body() updateBudgetDto: UpdateBudgetDto,
  ): Promise<BudgetProgress> {
    return this.budgetsService.updateBudget(allocationId, userId, updateBudgetDto);
  }

  /**
   * DELETE /budgets/:id?userId=xxx
   * Delete a budget allocation
   */
  @Delete(':id')
  @HttpCode(200)
  async deleteBudget(
    @Param('id') budgetId: string,
    @Query('userId') userId: string,
  ) {
    return this.budgetsService.deleteBudget(budgetId, userId);
  }
}
