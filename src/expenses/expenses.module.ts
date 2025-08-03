import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { ExpensesController } from './expenses.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [ExpensesController],
  providers: [],
  exports: [],
})
export class ExpensesModule {
  // Expenses and reimbursement module for HR system
}
