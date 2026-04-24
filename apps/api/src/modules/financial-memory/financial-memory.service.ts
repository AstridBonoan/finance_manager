import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@finance-app/db';
import { Decimal } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

export interface SpendingHabit {
  key: string;
  description: string;
  categoryId: string | null;
  categoryName: string;
  occurrenceCount: number;
  averageAmount: number;
  lastSeenAt: Date;
  cadence: 'weekly' | 'biweekly' | 'monthly' | 'irregular';
}

type AnomalyFeedback = 'normal' | 'flag' | 'ignore';

@Injectable()
export class FinancialMemoryService {
  async refreshMemory(userId: string) {
    const baselines = await this.recalculateBaselines(userId);
    await this.generateSpendingTrends(userId, 6);
    await this.generateCategoryTrends(userId, 6);
    const anomalies = await this.detectAnomalies(userId);
    const summary = await this.getMemorySummary(userId);

    return {
      baselineUpdates: baselines.length,
      newAnomalies: anomalies.length,
      summary,
    };
  }

  async getMemorySummary(userId: string) {
    const [baselines, trends, habits, anomalies] = await Promise.all([
      this.getBaselines(userId),
      this.getTrends(userId, 6),
      this.getHabits(userId),
      this.getAnomalies(userId),
    ]);

    const unresolvedAnomalies = anomalies.filter((a) => !a.isReviewed);
    const highSeverityAnomalies = anomalies.filter((a) => a.severity === 'high');
    const recurringHabits = habits.filter((h) => h.cadence !== 'irregular');

    return {
      baselineCount: baselines.length,
      trendCount: trends.length,
      habitCount: habits.length,
      anomalyCount: anomalies.length,
      unresolvedAnomalyCount: unresolvedAnomalies.length,
      highSeverityAnomalyCount: highSeverityAnomalies.length,
      recurringHabitCount: recurringHabits.length,
      topHabits: habits.slice(0, 5),
      recentAnomalies: anomalies.slice(0, 5),
      generatedAt: new Date(),
    };
  }

  async recalculateBaselines(userId: string) {
    const categories = await prisma.category.findMany({
      where: { userId },
      select: { id: true, name: true },
    });

    const updated = [];

    for (const category of categories) {
      const txns = await prisma.transaction.findMany({
        where: { userId, categoryId: category.id, type: 'expense' },
        select: { amount: true },
      });

      const amounts = txns.map((t) => Number(t.amount));
      if (amounts.length === 0) {
        continue;
      }

      const average = amounts.reduce((sum, value) => sum + value, 0) / amounts.length;
      const variance = amounts.reduce((sum, value) => sum + Math.pow(value - average, 2), 0) / amounts.length;
      const stdDeviation = Math.sqrt(variance);

      const baseline = await prisma.spendingBaseline.upsert({
        where: {
          userId_categoryId: {
            userId,
            categoryId: category.id,
          },
        },
        create: {
          userId,
          categoryId: category.id,
          averageMonthly: new Decimal(average),
          minMonthly: new Decimal(Math.min(...amounts)),
          maxMonthly: new Decimal(Math.max(...amounts)),
          stdDeviation: new Decimal(stdDeviation),
          dataPointCount: amounts.length,
        },
        update: {
          averageMonthly: new Decimal(average),
          minMonthly: new Decimal(Math.min(...amounts)),
          maxMonthly: new Decimal(Math.max(...amounts)),
          stdDeviation: new Decimal(stdDeviation),
          dataPointCount: amounts.length,
          lastCalculated: new Date(),
        },
      });

      updated.push({
        categoryId: category.id,
        categoryName: category.name,
        averageMonthly: Number(baseline.averageMonthly),
        minMonthly: Number(baseline.minMonthly),
        maxMonthly: Number(baseline.maxMonthly),
        stdDeviation: Number(baseline.stdDeviation),
        dataPointCount: baseline.dataPointCount,
      });
    }

    return updated;
  }

  async getBaselines(userId: string) {
    const baselines = await prisma.spendingBaseline.findMany({
      where: { userId },
      orderBy: { lastCalculated: 'desc' },
    });

    return baselines.map((b) => ({
      id: b.id,
      categoryId: b.categoryId,
      averageMonthly: Number(b.averageMonthly),
      minMonthly: Number(b.minMonthly),
      maxMonthly: Number(b.maxMonthly),
      stdDeviation: Number(b.stdDeviation),
      dataPointCount: b.dataPointCount,
      lastCalculated: b.lastCalculated,
    }));
  }

  async getTrends(userId: string, months: number = 6) {
    return prisma.spendingTrend.findMany({
      where: { userId },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
      take: Math.max(1, Math.min(months, 24)),
    });
  }

  async getAnomalies(userId: string) {
    return prisma.anomaly.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async generateSpendingTrends(userId: string, months: number = 6) {
    const boundedMonths = Math.max(1, Math.min(months, 24));
    const now = new Date();
    const generated = [];

    for (let i = boundedMonths - 1; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const startDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
      const endDate = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59);
      const prevStart = new Date(monthDate.getFullYear(), monthDate.getMonth() - 1, 1);
      const prevEnd = new Date(monthDate.getFullYear(), monthDate.getMonth(), 0, 23, 59, 59);

      const [currentTotal, previousTotal] = await Promise.all([
        prisma.transaction.aggregate({
          where: { userId, type: 'expense', date: { gte: startDate, lte: endDate } },
          _sum: { amount: true },
        }),
        prisma.transaction.aggregate({
          where: { userId, type: 'expense', date: { gte: prevStart, lte: prevEnd } },
          _sum: { amount: true },
        }),
      ]);

      const currentAmount = Number(currentTotal._sum.amount || 0);
      const previousAmount = Number(previousTotal._sum.amount || 0);
      const percentChange =
        previousAmount > 0 ? ((currentAmount - previousAmount) / previousAmount) * 100 : null;
      const trendDirection =
        percentChange === null
          ? 'stable'
          : percentChange > 5
            ? 'up'
            : percentChange < -5
              ? 'down'
              : 'stable';

      const existing = await prisma.spendingTrend.findFirst({
        where: {
          userId,
          year: monthDate.getFullYear(),
          month: monthDate.getMonth() + 1,
          categoryId: null,
        },
        select: { id: true },
      });

      const trend = existing
        ? await prisma.spendingTrend.update({
            where: { id: existing.id },
            data: {
              amount: new Decimal(currentAmount),
              percentChange: percentChange ?? undefined,
              trendDirection,
            },
          })
        : await prisma.spendingTrend.create({
            data: {
              userId,
              categoryId: null,
              year: monthDate.getFullYear(),
              month: monthDate.getMonth() + 1,
              amount: new Decimal(currentAmount),
              percentChange: percentChange ?? undefined,
              trendDirection,
            },
          });

      generated.push(trend);
    }

    return generated;
  }

  async generateCategoryTrends(userId: string, months: number = 6) {
    const boundedMonths = Math.max(1, Math.min(months, 24));
    const now = new Date();
    const categories = await prisma.category.findMany({
      where: { userId },
      select: { id: true, name: true },
    });

    const generated = [];
    for (const category of categories) {
      for (let i = boundedMonths - 1; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const startDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
        const endDate = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59);
        const prevStart = new Date(monthDate.getFullYear(), monthDate.getMonth() - 1, 1);
        const prevEnd = new Date(monthDate.getFullYear(), monthDate.getMonth(), 0, 23, 59, 59);

        const [currentTotal, previousTotal] = await Promise.all([
          prisma.transaction.aggregate({
            where: {
              userId,
              categoryId: category.id,
              type: 'expense',
              date: { gte: startDate, lte: endDate },
            },
            _sum: { amount: true },
          }),
          prisma.transaction.aggregate({
            where: {
              userId,
              categoryId: category.id,
              type: 'expense',
              date: { gte: prevStart, lte: prevEnd },
            },
            _sum: { amount: true },
          }),
        ]);

        const currentAmount = Number(currentTotal._sum.amount || 0);
        const previousAmount = Number(previousTotal._sum.amount || 0);
        const percentChange =
          previousAmount > 0 ? ((currentAmount - previousAmount) / previousAmount) * 100 : null;
        const trendDirection =
          percentChange === null
            ? 'stable'
            : percentChange > 5
              ? 'up'
              : percentChange < -5
                ? 'down'
                : 'stable';

        const existing = await prisma.spendingTrend.findFirst({
          where: {
            userId,
            year: monthDate.getFullYear(),
            month: monthDate.getMonth() + 1,
            categoryId: category.id,
          },
          select: { id: true },
        });

        const trend = existing
          ? await prisma.spendingTrend.update({
              where: { id: existing.id },
              data: {
                amount: new Decimal(currentAmount),
                percentChange: percentChange ?? undefined,
                trendDirection,
              },
            })
          : await prisma.spendingTrend.create({
              data: {
                userId,
                categoryId: category.id,
                year: monthDate.getFullYear(),
                month: monthDate.getMonth() + 1,
                amount: new Decimal(currentAmount),
                percentChange: percentChange ?? undefined,
                trendDirection,
              },
            });

        generated.push({
          categoryId: category.id,
          categoryName: category.name,
          trend,
        });
      }
    }

    return generated;
  }

  async detectAnomalies(userId: string) {
    const baselines = await prisma.spendingBaseline.findMany({ where: { userId } });
    const baselineMap = new Map<string, { avg: number; std: number }>(
      baselines.map((b) => [
        b.categoryId,
        { avg: Number(b.averageMonthly), std: Number(b.stdDeviation) || 1 },
      ]),
    );

    const recentCutoff = new Date();
    recentCutoff.setDate(recentCutoff.getDate() - 30);

    const transactions = await prisma.transaction.findMany({
      where: { userId, type: 'expense', date: { gte: recentCutoff }, categoryId: { not: null } },
      select: { id: true, amount: true, categoryId: true, description: true },
      orderBy: { date: 'desc' },
    });

    const created = [];
    for (const tx of transactions) {
      const baseline = tx.categoryId ? baselineMap.get(tx.categoryId) : undefined;
      if (!baseline) continue;

      const amount = Number(tx.amount);
      const upperThreshold = baseline.avg + 2 * baseline.std;
      if (amount <= upperThreshold) continue;

      const exists = await prisma.anomaly.findFirst({
        where: {
          userId,
          transactionId: tx.id,
          type: 'unusual_amount',
        },
        select: { id: true },
      });
      if (exists) continue;

      const deviationPercent = baseline.avg > 0 ? ((amount - baseline.avg) / baseline.avg) * 100 : null;
      const anomaly = await prisma.anomaly.create({
        data: {
          userId,
          categoryId: tx.categoryId,
          transactionId: tx.id,
          type: 'unusual_amount',
          severity: deviationPercent && deviationPercent > 100 ? 'high' : 'medium',
          description: `Transaction "${tx.description}" is unusually high versus baseline`,
          expectedAmount: new Decimal(baseline.avg),
          actualAmount: new Decimal(amount),
          deviationPercent: deviationPercent ?? undefined,
        },
      });
      created.push(anomaly);
    }

    return created;
  }

  async reviewAnomaly(
    userId: string,
    anomalyId: string,
    feedback: AnomalyFeedback,
  ) {
    const anomaly = await prisma.anomaly.findFirst({
      where: { id: anomalyId, userId },
      select: { id: true },
    });
    if (!anomaly) {
      throw new Error('Anomaly not found');
    }

    return prisma.anomaly.update({
      where: { id: anomalyId },
      data: {
        isReviewed: true,
        userFeedback: feedback,
      },
    });
  }

  async getCategoryTrends(userId: string, months: number = 6) {
    return prisma.spendingTrend.findMany({
      where: {
        userId,
        categoryId: { not: null },
      },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
      take: Math.max(1, Math.min(months * 20, 240)),
    });
  }

  async getHabits(userId: string): Promise<SpendingHabit[]> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 120);

    const expenses = await prisma.transaction.findMany({
      where: {
        userId,
        type: 'expense',
        date: { gte: cutoff },
      },
      include: {
        category: {
          select: { name: true },
        },
      },
      orderBy: { date: 'asc' },
    });

    const grouped = new Map<string, typeof expenses>();
    for (const tx of expenses) {
      const normalizedDescription = tx.description.trim().toLowerCase();
      const key = `${tx.categoryId || 'uncategorized'}:${normalizedDescription}`;
      const bucket = grouped.get(key);
      if (bucket) {
        bucket.push(tx);
      } else {
        grouped.set(key, [tx]);
      }
    }

    const habits: SpendingHabit[] = [];
    for (const [key, txns] of grouped.entries()) {
      if (txns.length < 3) {
        continue;
      }

      const intervals: number[] = [];
      for (let i = 1; i < txns.length; i++) {
        const diffMs = txns[i].date.getTime() - txns[i - 1].date.getTime();
        intervals.push(diffMs / (1000 * 60 * 60 * 24));
      }
      const avgInterval = intervals.length
        ? intervals.reduce((sum, value) => sum + value, 0) / intervals.length
        : 999;

      const cadence: SpendingHabit['cadence'] =
        avgInterval <= 9
          ? 'weekly'
          : avgInterval <= 18
            ? 'biweekly'
            : avgInterval <= 40
              ? 'monthly'
              : 'irregular';

      const averageAmount =
        txns.reduce((sum, tx) => sum + Number(tx.amount), 0) / txns.length;

      const lastTxn = txns[txns.length - 1];
      habits.push({
        key,
        description: lastTxn.description,
        categoryId: lastTxn.categoryId,
        categoryName: lastTxn.category?.name || 'Uncategorized',
        occurrenceCount: txns.length,
        averageAmount,
        lastSeenAt: lastTxn.date,
        cadence,
      });
    }

    return habits.sort((a, b) => {
      if (a.cadence === b.cadence) {
        return b.occurrenceCount - a.occurrenceCount;
      }
      return a.cadence.localeCompare(b.cadence);
    });
  }
}

