import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@finance-app/db';
import { CreateTransactionInput } from '@finance-app/shared';

const prisma = new PrismaClient();

@Injectable()
export class TransactionsService {
  /**
   * Create a new transaction
   */
  async create(userId: string, data: CreateTransactionInput) {
    try {
      const transaction = await prisma.transaction.create({
        data: {
          userId,
          amount: data.amount,
          description: data.description,
          date: data.date,
          type: data.type,
          categoryId: data.categoryId,
          notes: data.notes,
          tags: data.tags || [],
          isRecurring: data.isRecurring || false,
        },
        include: {
          category: true,
        },
      });
      return transaction;
    } catch (error) {
      throw new Error(`Failed to create transaction: ${error.message}`);
    }
  }

  /**
   * Get all transactions for a user with optional filtering
   */
  async findAll(
    userId: string,
    filters?: {
      categoryId?: string;
      type?: 'income' | 'expense';
      startDate?: Date;
      endDate?: Date;
      skip?: number;
      take?: number;
    }
  ) {
    const { skip = 0, take = 50, ...where } = filters || {};

    try {
      const [transactions, total] = await Promise.all([
        prisma.transaction.findMany({
          where: {
            userId,
            ...(where.categoryId && { categoryId: where.categoryId }),
            ...(where.type && { type: where.type }),
            ...(where.startDate || where.endDate) && {
              date: {
                ...(where.startDate && { gte: where.startDate }),
                ...(where.endDate && { lte: where.endDate }),
              },
            },
          },
          include: { category: true },
          orderBy: { date: 'desc' },
          skip,
          take,
        }),
        prisma.transaction.count({
          where: {
            userId,
            ...(where.categoryId && { categoryId: where.categoryId }),
            ...(where.type && { type: where.type }),
          },
        }),
      ]);

      return {
        items: transactions,
        total,
        page: Math.floor(skip / take) + 1,
        pageSize: take,
        totalPages: Math.ceil(total / take),
      };
    } catch (error) {
      throw new Error(`Failed to fetch transactions: ${error.message}`);
    }
  }

  /**
   * Get a single transaction by ID
   */
  async findOne(userId: string, transactionId: string) {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { category: true },
    });

    if (!transaction || transaction.userId !== userId) {
      throw new NotFoundException('Transaction not found');
    }

    return transaction;
  }

  /**
   * Update a transaction
   */
  async update(userId: string, transactionId: string, data: Partial<CreateTransactionInput>) {
    // Verify ownership
    const transaction = await this.findOne(userId, transactionId);

    try {
      const updated = await prisma.transaction.update({
        where: { id: transactionId },
        data: {
          ...(data.amount && { amount: data.amount }),
          ...(data.description && { description: data.description }),
          ...(data.date && { date: data.date }),
          ...(data.type && { type: data.type }),
          ...(data.categoryId && { categoryId: data.categoryId }),
          ...(data.notes !== undefined && { notes: data.notes }),
          ...(data.tags && { tags: data.tags }),
        },
        include: { category: true },
      });
      return updated;
    } catch (error) {
      throw new Error(`Failed to update transaction: ${error.message}`);
    }
  }

  /**
   * Delete a transaction
   */
  async delete(userId: string, transactionId: string) {
    // Verify ownership
    await this.findOne(userId, transactionId);

    try {
      await prisma.transaction.delete({
        where: { id: transactionId },
      });
      return { success: true, id: transactionId };
    } catch (error) {
      throw new Error(`Failed to delete transaction: ${error.message}`);
    }
  }

  /**
   * Get transaction summary for a date range
   */
  async getSummary(
    userId: string,
    startDate: Date,
    endDate: Date
  ) {
    try {
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

      const income = transactions
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const expenses = transactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const byCategory = transactions
        .filter((t) => t.type === 'expense')
        .reduce((acc, t) => {
          const categoryName = t.category?.name || 'Uncategorized';
          if (!acc[categoryName]) {
            acc[categoryName] = 0;
          }
          acc[categoryName] += Number(t.amount);
          return acc;
        }, {} as Record<string, number>);

      return {
        totalIncome: income,
        totalExpenses: expenses,
        balance: income - expenses,
        transactionCount: transactions.length,
        byCategory,
      };
    } catch (error) {
      throw new Error(`Failed to get summary: ${error.message}`);
    }
  }
}
