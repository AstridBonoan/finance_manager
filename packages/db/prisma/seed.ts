import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create default categories (will be expanded in Sprint 2)
  const categories = [
    { name: 'Salary', icon: '💼', color: '#10b981', isSystem: true },
    { name: 'Groceries', icon: '🛒', color: '#f59e0b', isSystem: true },
    { name: 'Utilities', icon: '⚡', color: '#8b5cf6', isSystem: true },
    { name: 'Transportation', icon: '🚗', color: '#3b82f6', isSystem: true },
    { name: 'Entertainment', icon: '🎬', color: '#ec4899', isSystem: true },
    { name: 'Healthcare', icon: '⚕️', color: '#ef4444', isSystem: true },
    { name: 'Savings', icon: '🏦', color: '#06b6d4', isSystem: true },
    { name: 'Investments', icon: '📈', color: '#14b8a6', isSystem: true },
  ];

  console.log('✅ Seed data prepared (will be created per user in future sprints)');
  console.log('✨ Database seed complete');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
