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
  UseGuards,
} from '@nestjs/common';
import { BudgetsService, CreateBudgetDto, UpdateBudgetDto, BudgetProgress } from './budgets.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../auth/decorators/current-user.decorator';

@Controller('budgets')
@UseGuards(JwtAuthGuard)
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  /**
   * POST /budgets
   * Create a new budget allocation
   */
  @Post()
  async createBudget(
    @Body() createBudgetDto: CreateBudgetDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.budgetsService.createBudget(createBudgetDto, user.id);
  }

  /**
   * GET /budgets?budgetId=xxx&userId=xxx
   * List all allocations for a budget
   */
  @Get()
  async listBudgets(
    @Query('budgetId') budgetId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<BudgetProgress[]> {
    return this.budgetsService.listBudgets(budgetId, user.id);
  }

  /**
   * GET /budgets/summary?budgetId=xxx&userId=xxx
   * Get budget summary
   */
  @Get('summary')
  async getBudgetSummary(
    @Query('budgetId') budgetId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.budgetsService.getBudgetSummary(budgetId, user.id);
  }

  /**
   * GET /budgets/:id?userId=xxx
   * Get single allocation with progress
   */
  @Get(':id')
  async getBudget(
    @Param('id') allocationId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<BudgetProgress> {
    return this.budgetsService.getBudget(allocationId, user.id);
  }

  /**
   * PATCH /budgets/:id?userId=xxx
   * Update a budget allocation
   */
  @Patch(':id')
  async updateBudget(
    @Param('id') allocationId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() updateBudgetDto: UpdateBudgetDto,
  ): Promise<BudgetProgress> {
    return this.budgetsService.updateBudget(allocationId, user.id, updateBudgetDto);
  }

  /**
   * DELETE /budgets/:id?userId=xxx
   * Delete a budget allocation
   */
  @Delete(':id')
  @HttpCode(200)
  async deleteBudget(
    @Param('id') budgetId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.budgetsService.deleteBudget(budgetId, user.id);
  }
}
