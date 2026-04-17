import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@finance-app/db';

const prisma = new PrismaClient();

@Injectable()
export class AnalyticsService {
  /**
   * Get dashboard summary for a user
   */
  async getDashboardSummary(userId: string, month?: number, year?: number) {
    const now = new Date();
    const targetMonth = month || now.getMonth() + 1;
    const targetYear = year || now.getFullYear();

    // Date range for the month
    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);

    try {
      // Get transactions for the period
      const transactions = await prisma.transaction.findMany({
        where: {
          userId,
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: { category: true },
      });

      // Calculate totals
      const totalIncome = transactions
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const totalExpenses = transactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      // Category breakdown
      const categoryBreakdown = transactions
        .filter((t) => t.type === 'expense')
        .reduce(
          (acc, t) => {
            const categoryName = t.category?.name || 'Uncategorized';
            const existing = acc.find((item) => item.category === categoryName);
            if (existing) {
              existing.amount += Number(t.amount);
              existing.count += 1;
            } else {
              acc.push({
                category: categoryName,
                categoryId: t.categoryId,
                amount: Number(t.amount),
                count: 1,
                color: t.category?.color || '#6B7280',
                icon: t.category?.icon,
              });
            }
            return acc;
          },
          [] as Array<{
            category: string;
            categoryId: string | null;
            amount: number;
            count: number;
            color: string;
            icon?: string;
          }>
        );

      // Recent transactions (last 10)
      const recentTransactions = transactions.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 10);

      // Get all categories for the user
      const allCategories = await prisma.category.findMany({
        where: { userId },
        orderBy: { name: 'asc' },
      });

      return {
        period: { month: targetMonth, year: targetYear },
        totalIncome,
        totalExpenses,
        balance: totalIncome - totalExpenses,
        transactionCount: transactions.length,
        categoryBreakdown: categoryBreakdown.sort((a, b) => b.amount - a.amount),
        recentTransactions: recentTransactions.map((t) => ({
          id: t.id,
          description: t.description,
          amount: Number(t.amount),
          type: t.type,
          date: t.date,
          category: t.category,
        })),
        allCategories,
      };
    } catch (error) {
      throw new Error(`Failed to get dashboard summary: ${error.message}`);
    }
  }

  /**
   * Get spending trend (month over month)
   */
  async getSpendingTrend(userId: string, months: number = 6) {
    try {
      const now = new Date();
      const trends = [];

      for (let i = months - 1; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
        const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);

        const monthlyExpenses = await prisma.transaction.aggregate({
          where: {
            userId,
            type: 'expense',
            date: {
              gte: startDate,
              lte: endDate,
            },
          },
          _sum: {
            amount: true,
          },
        });

        trends.push({
          month: date.getMonth() + 1,
          year: date.getFullYear(),
          amount: Number(monthlyExpenses._sum.amount || 0),
        });
      }

      return trends;
    } catch (error) {
      throw new Error(`Failed to get spending trend: ${error.message}`);
    }
  }

  /**
   * Get category analytics for a date range
   */
  async getCategoryAnalytics(userId: string, startDate: Date, endDate: Date) {
    try {
      const categoryData = await prisma.category.findMany({
        where: { userId },
      });

      const analytics = await Promise.all(
        categoryData.map(async (category) => {
          const transactions = await prisma.transaction.findMany({
            where: {
              userId,
              categoryId: category.id,
              type: 'expense',
              date: {
                gte: startDate,
                lte: endDate,
              },
            },
          });

          const total = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
          const average = transactions.length > 0 ? total / transactions.length : 0;

          return {
            categoryId: category.id,
            name: category.name,
            icon: category.icon,
            color: category.color,
            totalSpent: total,
            transactionCount: transactions.length,
            averagePerTransaction: average,
          };
        })
      );

      return analytics.filter((a) => a.totalSpent > 0);
    } catch (error) {
      throw new Error(`Failed to get category analytics: ${error.message}`);
    }
  }

  /**
   * Get income vs expense summary
   */
  async getIncomeVsExpense(userId: string, startDate: Date, endDate: Date) {
    try {
      const income = await prisma.transaction.aggregate({
        where: {
          userId,
          type: 'income',
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        _sum: {
          amount: true,
        },
      });

      const expenses = await prisma.transaction.aggregate({
        where: {
          userId,
          type: 'expense',
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        _sum: {
          amount: true,
        },
      });

      const totalIncome = Number(income._sum.amount || 0);
      const totalExpenses = Number(expenses._sum.amount || 0);

      return {
        income: totalIncome,
        expenses: totalExpenses,
        balance: totalIncome - totalExpenses,
        savingsRate: totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0,
      };
    } catch (error) {
      throw new Error(`Failed to get income vs expense: ${error.message}`);
    }
  }
}
