import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@finance-app/db';
import { FinancialMemoryService } from '../financial-memory/financial-memory.service';

const prisma = new PrismaClient();

export interface AdvisorContext {
  monthlyIncome: number;
  monthlyExpenses: number;
  balance: number;
  topExpenseCategories: Array<{ category: string; amount: number }>;
  unresolvedAnomalyCount: number;
  recurringHabitCount: number;
}

@Injectable()
export class AdvisorService {
  constructor(private readonly financialMemoryService: FinancialMemoryService) {}

  async buildContext(userId: string): Promise<AdvisorContext> {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const transactions = await prisma.transaction.findMany({
      where: { userId, date: { gte: start, lte: end } },
      include: { category: true },
    });

    const monthlyIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const monthlyExpenses = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const topExpenseCategories = transactions
      .filter((t) => t.type === 'expense')
      .reduce((acc, t) => {
        const key = t.category?.name || 'Uncategorized';
        acc[key] = (acc[key] || 0) + Number(t.amount);
        return acc;
      }, {} as Record<string, number>);

    const topExpenseCategoriesList = Object.entries(topExpenseCategories)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3);

    const memorySummary = await this.financialMemoryService.getMemorySummary(userId);

    return {
      monthlyIncome,
      monthlyExpenses,
      balance: monthlyIncome - monthlyExpenses,
      topExpenseCategories: topExpenseCategoriesList,
      unresolvedAnomalyCount: memorySummary.unresolvedAnomalyCount,
      recurringHabitCount: memorySummary.recurringHabitCount,
    };
  }

  async getInsights(userId: string) {
    const context = await this.buildContext(userId);
    const savingsRate =
      context.monthlyIncome > 0
        ? ((context.monthlyIncome - context.monthlyExpenses) / context.monthlyIncome) * 100
        : 0;

    return {
      summary: {
        monthlyIncome: context.monthlyIncome,
        monthlyExpenses: context.monthlyExpenses,
        balance: context.balance,
        savingsRate,
      },
      insights: [
        {
          type: 'budget_health',
          message:
            savingsRate >= 20
              ? 'Your monthly savings rate looks strong.'
              : 'Your monthly savings rate is below target; review discretionary spending.',
        },
        {
          type: 'risk_monitoring',
          message:
            context.unresolvedAnomalyCount > 0
              ? `You have ${context.unresolvedAnomalyCount} unresolved spending anomalies to review.`
              : 'No unresolved anomalies detected this cycle.',
        },
      ],
      topExpenseCategories: context.topExpenseCategories,
    };
  }

  async chat(userId: string, message: string) {
    const context = await this.buildContext(userId);

    // Sprint 6 phase 1: structured local response path.
    // OpenAI call wiring will replace this deterministic response in next iterations.
    return {
      reply: `You asked: "${message}". This month your income is $${context.monthlyIncome.toFixed(
        2,
      )}, expenses are $${context.monthlyExpenses.toFixed(
        2,
      )}, and balance is $${context.balance.toFixed(
        2,
      )}. I found ${context.unresolvedAnomalyCount} unresolved anomalies and ${context.recurringHabitCount} recurring habits.`,
      context,
      model: 'local-fallback',
    };
  }
}

