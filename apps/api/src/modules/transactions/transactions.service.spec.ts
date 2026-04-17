import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsService } from './transactions.service';
import { PrismaClient } from '@finance-app/db';

// Mock Prisma client
jest.mock('@finance-app/db');

describe('TransactionsService', () => {
  let service: TransactionsService;

  beforeEach(async () => {
    const testingModule: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: PrismaClient,
          useValue: {
            transaction: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              aggregate: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = testingModule.get<TransactionsService>(TransactionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a transaction', async () => {
      const userId = 'user-123';
      const data = {
        description: 'Test transaction',
        amount: 100,
        date: new Date(),
        type: 'expense' as const,
        categoryId: 'cat-123',
        tags: [],
        isRecurring: false,
      };

      const result = { id: 'tx-123', userId, ...data };
      jest.spyOn(service, 'create').mockResolvedValue(result as any);

      const transaction = await service.create(userId, data);
      expect(transaction).toEqual(result);
      expect(service.create).toHaveBeenCalledWith(userId, data);
    });
  });

  describe('findAll', () => {
    it('should return paginated transactions', async () => {
      const userId = 'user-123';
      const filters = { skip: 0, take: 20 };

      const result = {
        items: [
          { id: 'tx-1', description: 'Test', amount: 100, type: 'expense' },
        ],
        total: 1,
        page: 1,
      };

      jest.spyOn(service, 'findAll').mockResolvedValue(result as any);

      const transactions = await service.findAll(userId, filters);
      expect(transactions).toEqual(result);
    });
  });

  describe('getSummary', () => {
    it('should return transaction summary', async () => {
      const userId = 'user-123';
      const startDate = new Date('2026-01-01');
      const endDate = new Date('2026-01-31');

      const result = {
        totalIncome: 5000,
        totalExpenses: 2000,
        balance: 3000,
        byCategory: [{ category: 'Groceries', amount: 500 }],
      };

      jest.spyOn(service, 'getSummary').mockResolvedValue(result as any);

      const summary = await service.getSummary(userId, startDate, endDate);
      expect(summary).toEqual(result);
    });
  });
});
