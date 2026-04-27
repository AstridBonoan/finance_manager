import { Module } from '@nestjs/common';
import { AdvisorController } from './advisor.controller';
import { AdvisorService } from './advisor.service';
import { FinancialMemoryModule } from '../financial-memory/financial-memory.module';

@Module({
  imports: [FinancialMemoryModule],
  controllers: [AdvisorController],
  providers: [AdvisorService],
  exports: [AdvisorService],
})
export class AdvisorModule {}

