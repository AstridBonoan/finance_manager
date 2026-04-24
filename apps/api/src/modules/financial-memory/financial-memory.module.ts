import { Module } from '@nestjs/common';
import { FinancialMemoryController } from './financial-memory.controller';
import { FinancialMemoryService } from './financial-memory.service';

@Module({
  controllers: [FinancialMemoryController],
  providers: [FinancialMemoryService],
  exports: [FinancialMemoryService],
})
export class FinancialMemoryModule {}

