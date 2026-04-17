import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaClient } from '@finance-app/db';
import { CreateCategoryInput } from '@finance-app/shared';

const prisma = new PrismaClient();

@Injectable()
export class CategoriesService {
  /**
   * Create default system categories for a user
   */
  async createDefaults(userId: string) {
    const defaultCategories = [
      { name: 'Salary', icon: '💼', color: '#10b981', isSystem: true },
      { name: 'Groceries', icon: '🛒', color: '#f59e0b', isSystem: true },
      { name: 'Utilities', icon: '⚡', color: '#8b5cf6', isSystem: true },
      { name: 'Transportation', icon: '🚗', color: '#3b82f6', isSystem: true },
      { name: 'Entertainment', icon: '🎬', color: '#ec4899', isSystem: true },
      { name: 'Healthcare', icon: '⚕️', color: '#ef4444', isSystem: true },
      { name: 'Savings', icon: '🏦', color: '#06b6d4', isSystem: true },
      { name: 'Investments', icon: '📈', color: '#14b8a6', isSystem: true },
      { name: 'Dining Out', icon: '🍔', color: '#d97706', isSystem: true },
      { name: 'Shopping', icon: '🛍️', color: '#a855f7', isSystem: true },
    ];

    const created = await Promise.all(
      defaultCategories.map((cat, idx) =>
        prisma.category.create({
          data: {
            userId,
            ...cat,
            order: idx,
          },
        })
      )
    );

    return created;
  }

  /**
   * Create a new custom category
   */
  async create(userId: string, data: CreateCategoryInput) {
    try {
      // Check if category name already exists for this user
      const existing = await prisma.category.findUnique({
        where: {
          userId_name: {
            userId,
            name: data.name,
          },
        },
      });

      if (existing) {
        throw new ConflictException(`Category "${data.name}" already exists`);
      }

      const category = await prisma.category.create({
        data: {
          userId,
          name: data.name,
          description: data.description,
          color: data.color,
          icon: data.icon,
          isSystem: false,
        },
      });

      return category;
    } catch (error) {
      if (error instanceof ConflictException) throw error;
      throw new Error(`Failed to create category: ${error.message}`);
    }
  }

  /**
   * Get all categories for a user
   */
  async findAll(userId: string) {
    try {
      const categories = await prisma.category.findMany({
        where: { userId },
        orderBy: [{ isSystem: 'desc' }, { order: 'asc' }, { name: 'asc' }],
      });

      return categories;
    } catch (error) {
      throw new Error(`Failed to fetch categories: ${error.message}`);
    }
  }

  /**
   * Get a single category
   */
  async findOne(userId: string, categoryId: string) {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category || category.userId !== userId) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  /**
   * Update a category
   */
  async update(userId: string, categoryId: string, data: Partial<CreateCategoryInput>) {
    // Verify ownership
    await this.findOne(userId, categoryId);

    try {
      const updated = await prisma.category.update({
        where: { id: categoryId },
        data: {
          ...(data.name && { name: data.name }),
          ...(data.description !== undefined && { description: data.description }),
          ...(data.color && { color: data.color }),
          ...(data.icon && { icon: data.icon }),
        },
      });

      return updated;
    } catch (error) {
      throw new Error(`Failed to update category: ${error.message}`);
    }
  }

  /**
   * Delete a custom category
   */
  async delete(userId: string, categoryId: string) {
    const category = await this.findOne(userId, categoryId);

    if (category.isSystem) {
      throw new ConflictException('Cannot delete system categories');
    }

    try {
      // Remove category from transactions
      await prisma.transaction.updateMany({
        where: { categoryId },
        data: { categoryId: null },
      });

      await prisma.category.delete({
        where: { id: categoryId },
      });

      return { success: true, id: categoryId };
    } catch (error) {
      throw new Error(`Failed to delete category: ${error.message}`);
    }
  }

  /**
   * Get category statistics (spending totals)
   */
  async getStats(userId: string, startDate: Date, endDate: Date) {
    try {
      const categories = await prisma.category.findMany({
        where: { userId },
      });

      const stats = await Promise.all(
        categories.map(async (cat) => {
          const total = await prisma.transaction.aggregate({
            where: {
              userId,
              categoryId: cat.id,
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

          return {
            categoryId: cat.id,
            name: cat.name,
            icon: cat.icon,
            color: cat.color,
            spent: Number(total._sum.amount || 0),
          };
        })
      );

      return stats.filter((s) => s.spent > 0);
    } catch (error) {
      throw new Error(`Failed to get category stats: ${error.message}`);
    }
  }
}
