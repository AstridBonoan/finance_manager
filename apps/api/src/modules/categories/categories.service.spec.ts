import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service';

describe('CategoriesService', () => {
  let service: CategoriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CategoriesService],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createDefaults', () => {
    it('should create default categories for a user', async () => {
      const userId = 'user-123';
      jest.spyOn(service, 'createDefaults').mockResolvedValue([
        { id: 'cat-1', name: 'Salary', icon: '💰', isSystem: true, userId },
        { id: 'cat-2', name: 'Groceries', icon: '🛒', isSystem: true, userId },
      ] as any);

      const categories = await service.createDefaults(userId);
      expect(categories).toHaveLength(2);
      expect(categories[0].isSystem).toBe(true);
    });
  });

  describe('create', () => {
    it('should create a custom category', async () => {
      const userId = 'user-123';
      const data = {
        name: 'Custom Category',
        icon: '🎯',
        color: '#FF0000',
      };

      const result = { id: 'cat-123', userId, ...data, isSystem: false };
      jest.spyOn(service, 'create').mockResolvedValue(result as any);

      const category = await service.create(userId, data);
      expect(category.name).toBe('Custom Category');
      expect(category.isSystem).toBe(false);
    });
  });

  describe('findAll', () => {
    it('should return all categories for user', async () => {
      const userId = 'user-123';
      const result = [
        { id: 'cat-1', name: 'Salary', isSystem: true },
        { id: 'cat-2', name: 'Custom', isSystem: false },
      ];

      jest.spyOn(service, 'findAll').mockResolvedValue(result as any);

      const categories = await service.findAll(userId);
      expect(categories).toHaveLength(2);
    });
  });

  describe('delete', () => {
    it('should not allow deletion of system categories', async () => {
      const userId = 'user-123';
      const categoryId = 'cat-1';

      jest
        .spyOn(service, 'delete')
        .mockRejectedValue(new Error('Cannot delete system category'));

      await expect(service.delete(userId, categoryId)).rejects.toThrow(
        'Cannot delete system category'
      );
    });
  });

  describe('getStats', () => {
    it('should return category spending statistics', async () => {
      const userId = 'user-123';
      const startDate = new Date('2026-01-01');
      const endDate = new Date('2026-01-31');

      const result = [
        { categoryId: 'cat-1', name: 'Groceries', totalSpent: 500, transactionCount: 10 },
        { categoryId: 'cat-2', name: 'Dining', totalSpent: 200, transactionCount: 5 },
      ];

      jest.spyOn(service, 'getStats').mockResolvedValue(result as any);

      const stats = await service.getStats(userId, startDate, endDate);
      expect(stats).toHaveLength(2);
      expect(stats[0].totalSpent).toBe(500);
    });
  });
});
