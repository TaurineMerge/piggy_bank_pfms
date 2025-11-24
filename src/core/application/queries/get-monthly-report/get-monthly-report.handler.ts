import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { GetMonthlyReportDto } from './get-monthly-report.dto';
import { ITransactionRepository } from '../../../domain/repositories/transaction.repository.interface';
import { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { DateRange } from '../../../domain/value-objects/date-range.vo';
import { Money } from '../../../domain/value-objects/money.vo';
import { Transaction } from '../../../domain/entities/transaction.entity';

export interface MonthlyReportResult {
  period: {
    start: Date;
    end: Date;
  };
  totalIncome: string;
  totalExpenses: string;
  balance: string;
  expensesByCategory: CategoryExpense[];
  transactionCount: number;
}

export interface CategoryExpense {
  categoryId: string;
  total: string;
  count: number;
}

@Injectable()
export class GetMonthlyReportHandler {
  constructor(
    @Inject('TRANSACTION_REPOSITORY')
    private transactionRepository: ITransactionRepository,

    @Inject('USER_REPOSITORY')
    private userRepository: IUserRepository,
  ) {}

  async execute(dto: GetMonthlyReportDto): Promise<MonthlyReportResult> {
    // 1. Check if user exists
    const user = await this.userRepository.findByTelegramId(dto.telegramId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // 2. Determine the period
    const dateRange = DateRange.fromMonth(dto.month);

    // 3. Get transactions
    const transactions =
      await this.transactionRepository.findByUserIdAndDateRange(
        user.id,
        dateRange,
      );

    // 4. Calculate total income, total expenses, and balance
    const income = this.calculateTotalIncome(
      transactions,
      user.defaultCurrency,
    );
    const expenses = this.calculateTotalExpenses(
      transactions,
      user.defaultCurrency,
    );
    const balance = income.subtract(expenses);

    // 5. Group expenses by category
    const expensesByCategory = this.groupByCategory(
      transactions.filter((t) => !t.isIncome()),
    );

    // 6. Return report
    return {
      period: {
        start: dateRange.startDate,
        end: dateRange.endDate,
      },
      totalIncome: income.format(),
      totalExpenses: expenses.format(),
      balance: balance.format(),
      expensesByCategory: Array.from(expensesByCategory.values()).map(
        (cat) => ({
          categoryId: cat.categoryId,
          total: cat.total.format(),
          count: cat.count,
        }),
      ),
      transactionCount: transactions.length,
    };
  }

  private calculateTotalIncome(
    transactions: Transaction[],
    currency: any,
  ): Money {
    return transactions
      .filter((t) => t.isIncome())
      .reduce((sum, t) => sum.add(t.amount), new Money(0, currency));
  }

  private calculateTotalExpenses(
    transactions: Transaction[],
    currency: any,
  ): Money {
    return transactions
      .filter((t) => !t.isIncome())
      .reduce((sum, t) => sum.add(t.amount), new Money(0, currency));
  }

  private groupByCategory(
    transactions: Transaction[],
  ): Map<string, { categoryId: string; total: Money; count: number }> {
    const groups = new Map();

    transactions.forEach((t) => {
      const existing = groups.get(t.categoryId);

      if (existing) {
        existing.total = existing.total.add(t.amount);
        existing.count++;
      } else {
        groups.set(t.categoryId, {
          categoryId: t.categoryId,
          total: t.amount,
          count: 1,
        });
      }
    });

    return groups;
  }
}
