import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@finance-app/db';
import { Decimal } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

export interface CreateBudgetDto {
  budgetId: string;
  categoryId: string;
  amount: number;
  percentOfIncome?: number;
}

export interface UpdateBudgetDto {
  allocatedAmount?: number;
  percentOfIncome?: number;
}

export interface BudgetProgress {
  id: string;
  categoryId: string;
  categoryName: string;
  allocated: number;
  spent: number;
  remaining: number;
  usagePercentage: number;
}

@Injectable()
export class BudgetsService {

  /**
   * Create allocation for a budget category
   */
  async createBudget(dto: CreateBudgetDto, requesterUserId: string) {
    // Get budget to get userId
    const budget = await prisma.budget.findUniqueOrThrow({
      where: { id: dto.budgetId },
      select: { userId: true },
    });
    if (budget.userId !== requesterUserId) {
      throw new Error('Unauthorized');
    }

    const allocation = await prisma.budgetAllocation.create({
      data: {
        budgetId: dto.budgetId,
        categoryId: dto.categoryId,
        userId: budget.userId,
        allocatedAmount: new Decimal(dto.amount),
        percentOfIncome: dto.percentOfIncome,
      },
      include: {
        category: true,
      },
    });

    return {
      id: allocation.id,
      categoryId: allocation.categoryId,
      categoryName: allocation.category.name,
      allocatedAmount: allocation.allocatedAmount.toNumber(),
      actualSpent: allocation.actualSpent.toNumber(),
      percentOfIncome: allocation.percentOfIncome,
      createdAt: allocation.createdAt,
    };
  }

  /**
   * Get single budget allocation with spending progress
   */
  async getBudget(allocationId: string, userId: string): Promise<BudgetProgress> {
    const allocation = await prisma.budgetAllocation.findUniqueOrThrow({
      where: { id: allocationId },
      include: {
        budget: {
          select: { userId: true },
        },
        category: true,
      },
    });

    // Validate ownership
    if (allocation.budget.userId !== userId) {
      throw new Error('Unauthorized');
    }

    const spent = allocation.actualSpent.toNumber();
    const allocated = allocation.allocatedAmount.toNumber();
    const usagePercentage = (spent / allocated) * 100;
    const remaining = Math.max(0, allocated - spent);

    return {
      id: allocation.id,
      categoryId: allocation.categoryId,
      categoryName: allocation.category.name,
      allocated,
      spent,
      remaining,
      usagePercentage,
    };
  }

  /**
   * List all allocations for a budget
   */
  async listBudgets(budgetId: string, userId: string): Promise<BudgetProgress[]> {
    const budget = await prisma.budget.findUniqueOrThrow({
      where: { id: budgetId },
      select: { userId: true },
    });

    if (budget.userId !== userId) {
      throw new Error('Unauthorized');
    }

    const allocations = await prisma.budgetAllocation.findMany({
      where: { budgetId },
      include: {
        category: true,
      },
    });

    return allocations.map((alloc) => ({
      id: alloc.id,
      categoryId: alloc.categoryId,
      categoryName: alloc.category.name,
      allocated: alloc.allocatedAmount.toNumber(),
      spent: alloc.actualSpent.toNumber(),
      remaining: Math.max(0, alloc.allocatedAmount.toNumber() - alloc.actualSpent.toNumber()),
      usagePercentage: (alloc.actualSpent.toNumber() / alloc.allocatedAmount.toNumber()) * 100,
    }));
  }

  /**
   * Get budget summary
   */
  async getBudgetSummary(budgetId: string, userId: string) {
    const budget = await prisma.budget.findUniqueOrThrow({
      where: { id: budgetId },
      select: { userId: true, totalIncome: true },
    });

    if (budget.userId !== userId) {
      throw new Error('Unauthorized');
    }

    const allocations = await prisma.budgetAllocation.findMany({
      where: { budgetId },
      include: { category: true },
    });

    let totalAllocated = 0;
    let totalSpent = 0;

    allocations.forEach((alloc) => {
      totalAllocated += alloc.allocatedAmount.toNumber();
      totalSpent += alloc.actualSpent.toNumber();
    });

    return {
      totalIncome: budget.totalIncome.toNumber(),
      totalAllocated,
      totalSpent,
      remaining: totalAllocated - totalSpent,
      allocations: allocations.map((a) => ({
        categoryId: a.categoryId,
        categoryName: a.category.name,
        allocated: a.allocatedAmount.toNumber(),
        spent: a.actualSpent.toNumber(),
        usagePercentage: (a.actualSpent.toNumber() / a.allocatedAmount.toNumber()) * 100,
      })),
    };
  }

  /**
   * Update budget allocation
   */
  async updateBudget(
    allocationId: string,
    userId: string,
    dto: UpdateBudgetDto,
  ): Promise<BudgetProgress> {
    const allocation = await prisma.budgetAllocation.findUniqueOrThrow({
      where: { id: allocationId },
      include: {
        budget: { select: { userId: true } },
        category: true,
      },
    });

    if (allocation.budget.userId !== userId) {
      throw new Error('Unauthorized');
    }

    const updated = await prisma.budgetAllocation.update({
      where: { id: allocationId },
      data: {
        allocatedAmount: dto.allocatedAmount
          ? new Decimal(dto.allocatedAmount)
          : undefined,
        percentOfIncome: dto.percentOfIncome,
      },
      include: { category: true },
    });

    const spent = updated.actualSpent.toNumber();
    const allocated = updated.allocatedAmount.toNumber();

    return {
      id: updated.id,
      categoryId: updated.categoryId,
      categoryName: updated.category.name,
      allocated,
      spent,
      remaining: Math.max(0, allocated - spent),
      usagePercentage: (spent / allocated) * 100,
    };
  }

  /**
   * Delete budget allocation
   */
  async deleteBudget(allocationId: string, userId: string): Promise<void> {
    const allocation = await prisma.budgetAllocation.findUniqueOrThrow({
      where: { id: allocationId },
      include: {
        budget: { select: { userId: true } },
      },
    });

    if (allocation.budget.userId !== userId) {
      throw new Error('Unauthorized');
    }

    await prisma.budgetAllocation.delete({
      where: { id: allocationId },
    });
  }

  /**
   * Get budgets for a user in a period
   */
  async getUserBudgets(
    userId: string,
    month: number,
    year: number,
  ): Promise<BudgetProgress[]> {
    const budget = await prisma.budget.findFirst({
      where: { userId, month, year },
      include: { allocations: { include: { category: true } } },
    });

    if (!budget) {
      return [];
    }

    return budget.allocations.map((alloc) => ({
      id: alloc.id,
      categoryId: alloc.categoryId,
      categoryName: alloc.category.name,
      allocated: alloc.allocatedAmount.toNumber(),
      spent: alloc.actualSpent.toNumber(),
      remaining: Math.max(0, alloc.allocatedAmount.toNumber() - alloc.actualSpent.toNumber()),
      usagePercentage:
        (alloc.actualSpent.toNumber() / alloc.allocatedAmount.toNumber()) * 100,
    }));
  }

  /**
   * Create monthly budget for user
   */
  async createMonthlyBudget(
    userId: string,
    month: number,
    year: number,
    totalIncome: number,
  ) {
    const budget = await prisma.budget.create({
      data: {
        userId,
        month,
        year,
        totalIncome: new Decimal(totalIncome),
        rules: {},
      },
    });

    return {
      id: budget.id,
      userId: budget.userId,
      month: budget.month,
      year: budget.year,
      totalIncome: budget.totalIncome.toNumber(),
      createdAt: budget.createdAt,
    };
  }
}
