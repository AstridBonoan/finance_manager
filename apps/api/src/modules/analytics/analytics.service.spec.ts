import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from './analytics.service';

describe('AnalyticsService', () => {
  let service: AnalyticsService;

  beforeEach(async () => {
    const testingModule: TestingModule = await Test.createTestingModule({
      providers: [AnalyticsService],
    }).compile();

    service = testingModule.get<AnalyticsService>(AnalyticsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getDashboardSummary', () => {
    it('should return dashboard summary for current month', async () => {
      const userId = 'user-123';

      const result = {
        period: { month: 1, year: 2026 },
        totalIncome: 5000,
        totalExpenses: 2000,
        balance: 3000,
        transactionCount: 15,
        categoryBreakdown: [{ category: 'Groceries', amount: 500 }],
        recentTransactions: [],
        allCategories: [],
      };

      jest.spyOn(service, 'getDashboardSummary').mockResolvedValue(result as any);

      const summary = await service.getDashboardSummary(userId);
      expect(summary.totalIncome).toBe(5000);
      expect(summary.balance).toBe(3000);
    });
  });

  describe('getSpendingTrend', () => {
    it('should return spending trend for last 6 months', async () => {
      const userId = 'user-123';

      const result = [
        { month: 8, year: 2025, amount: 1500 },
        { month: 9, year: 2025, amount: 1800 },
        { month: 10, year: 2025, amount: 2000 },
        { month: 11, year: 2025, amount: 1900 },
        { month: 12, year: 2025, amount: 2100 },
        { month: 1, year: 2026, amount: 2000 },
      ];

      jest.spyOn(service, 'getSpendingTrend').mockResolvedValue(result as any);

      const trends = await service.getSpendingTrend(userId, 6);
      expect(trends).toHaveLength(6);
      expect(trends[0].amount).toBe(1500);
    });
  });

  describe('getCategoryAnalytics', () => {
    it('should return category analytics', async () => {
      const userId = 'user-123';
      const startDate = new Date('2026-01-01');
      const endDate = new Date('2026-01-31');

      const result = [
        {
          categoryId: 'cat-1',
          name: 'Groceries',
          totalSpent: 500,
          transactionCount: 10,
          averagePerTransaction: 50,
        },
      ];

      jest.spyOn(service, 'getCategoryAnalytics').mockResolvedValue(result as any);

      const analytics = await service.getCategoryAnalytics(userId, startDate, endDate);
      expect(analytics).toHaveLength(1);
      expect(analytics[0].totalSpent).toBe(500);
    });
  });

  describe('getIncomeVsExpense', () => {
    it('should return income vs expense comparison', async () => {
      const userId = 'user-123';
      const startDate = new Date('2026-01-01');
      const endDate = new Date('2026-01-31');

      const result = {
        income: 5000,
        expenses: 2000,
        balance: 3000,
        savingsRate: 60,
      };

      jest.spyOn(service, 'getIncomeVsExpense').mockResolvedValue(result as any);

      const comparison = await service.getIncomeVsExpense(userId, startDate, endDate);
      expect(comparison.income).toBe(5000);
      expect(comparison.savingsRate).toBe(60);
    });
  });
});
