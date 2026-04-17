import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@finance-app/db';
import { Decimal } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

export interface AllocationRule {
  categoryId: string;
  percentage: number;
}

export interface AllocationResult {
  categoryId: string;
  categoryName: string;
  allocated: number;
  spent: number;
  percentage: number;
}

@Injectable()
export class AllocationsService {

  /**
   * Set allocation rules for a monthly budget
   */
  async setAllocationRules(
    budgetId: string,
    userId: string,
    rules: AllocationRule[],
  ): Promise<AllocationRule[]> {
    // Validate percentages sum to <= 100%
    const totalPercentage = rules.reduce((sum, r) => sum + r.percentage, 0);
    if (totalPercentage > 100) {
      throw new Error('Total allocation percentage cannot exceed 100%');
    }

    // Verify budget ownership
    const budget = await prisma.budget.findUniqueOrThrow({
      where: { id: budgetId },
      select: { userId: true },
    });

    if (budget.userId !== userId) {
      throw new Error('Unauthorized');
    }

    // Update budget rules
    await prisma.budget.update({
      where: { id: budgetId },
      data: {
        rules: Object.fromEntries(rules.map((r) => [r.categoryId, r.percentage])),
      },
    });

    return rules;
  }

  /**
   * Calculate allocation for a budget
   */
  async calculateAllocation(
    budgetId: string,
    userId: string,
  ): Promise<AllocationResult[]> {
    const budget = await prisma.budget.findUniqueOrThrow({
      where: { id: budgetId },
      select: { userId: true, totalIncome: true, rules: true },
    });

    if (budget.userId !== userId) {
      throw new Error('Unauthorized');
    }

    const totalIncome = budget.totalIncome.toNumber();
    const rulesObj = budget.rules as Record<string, number>;

    const allocations: AllocationResult[] = [];

    for (const [categoryId, percentage] of Object.entries(rulesObj)) {
      const category = await prisma.category.findUnique({
        where: { id: categoryId },
      });

      if (!category) continue;

      const allocated = (totalIncome * (percentage as number)) / 100;

      allocations.push({
        categoryId,
        categoryName: category.name,
        allocated,
        spent: 0,
        percentage: percentage as number,
      });
    }

    return allocations;
  }

  /**
   * Get allocation recommendations based on spending
   */
  async getRecommendations(userId: string): Promise<AllocationResult[]> {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        type: 'expense',
        date: { gte: threeMonthsAgo },
      },
      include: { category: true },
    });

    const categorySpending = new Map<string, { spent: number; name: string }>();
    let totalSpent = 0;

    for (const tx of transactions) {
      const current = categorySpending.get(tx.categoryId);
      if (current) {
        current.spent += tx.amount.toNumber();
      } else {
        categorySpending.set(tx.categoryId, {
          spent: tx.amount.toNumber(),
          name: tx.category.name,
        });
      }
      totalSpent += tx.amount.toNumber();
    }

    const recommendations: AllocationResult[] = [];

    for (const [categoryId, data] of categorySpending.entries()) {
      const percentage = (data.spent / totalSpent) * 100;

      recommendations.push({
        categoryId,
        categoryName: data.name,
        allocated: data.spent / 3,
        spent: data.spent,
        percentage: Math.round(percentage * 10) / 10,
      });
    }

    return recommendations.sort((a, b) => b.percentage - a.percentage);
  }

  /**
   * Get current allocation usage
   */
  async getAllocationUsage(budgetId: string, userId: string): Promise<AllocationResult[]> {
    const budget = await prisma.budget.findUniqueOrThrow({
      where: { id: budgetId },
      select: { userId: true, month: true, year: true },
    });

    if (budget.userId !== userId) {
      throw new Error('Unauthorized');
    }

    const allocations = await prisma.budgetAllocation.findMany({
      where: { budgetId },
      include: { category: true },
    });

    const results: AllocationResult[] = [];

    for (const alloc of allocations) {
      const allocated = alloc.allocatedAmount.toNumber();
      const spent = alloc.actualSpent.toNumber();
      const percentage = alloc.percentOfIncome || 0;

      results.push({
        categoryId: alloc.categoryId,
        categoryName: alloc.category.name,
        allocated,
        spent,
        percentage,
      });
    }

    return results;
  }
}

