import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { BudgetsModule } from './modules/budgets/budgets.module';
import { AllocationsModule } from './modules/allocations/allocations.module';
import { ReceiptsModule } from './modules/receipts/receipts.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.local',
    }),
    AuthModule,
    UsersModule,
    TransactionsModule,
    CategoriesModule,
    AnalyticsModule,
    BudgetsModule,
    AllocationsModule,
    ReceiptsModule,
  ],
})
export class AppModule {}
