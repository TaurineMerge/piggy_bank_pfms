import { Injectable } from '@nestjs/common';
import { CreateTransactionHandler } from '../../core/application/commands/create-transaction/create-transaction.handler';
import { UpdateTransactionHandler } from '../../core/application/commands/update-transaction/update-transaction.handler';
import { DeleteTransactionHandler } from '../../core/application/commands/delete-transaction/delete-transaction.handler';
import { GetTransactionHistoryHandler } from '../../core/application/queries/get-transaction-history/get-transaction-history.handler';
import { CreateTransactionDto } from '../../core/application/commands/create-transaction/create-transaction.dto';
import { UpdateTransactionDto } from '../../core/application/commands/update-transaction/update-transaction.dto';
import { DeleteTransactionDto } from '../../core/application/commands/delete-transaction/delete-transaction.dto';
import { GetTransactionHistoryDto } from '../../core/application/queries/get-transaction-history/get-transaction-history.dto';

@Injectable()
export class TransactionService {
  constructor(
    private createTransactionHandler: CreateTransactionHandler,
    private updateTransactionHandler: UpdateTransactionHandler,
    private deleteTransactionHandler: DeleteTransactionHandler,
    private getTransactionHistoryHandler: GetTransactionHistoryHandler,
  ) {}

  async createTransaction(dto: CreateTransactionDto) {
    return this.createTransactionHandler.execute(dto);
  }

  async updateTransaction(dto: UpdateTransactionDto) {
    return this.updateTransactionHandler.execute(dto);
  }

  async deleteTransaction(dto: DeleteTransactionDto) {
    return this.deleteTransactionHandler.execute(dto);
  }

  async getHistory(dto: GetTransactionHistoryDto) {
    return this.getTransactionHistoryHandler.execute(dto);
  }
}
