import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { TransactionService } from './transaction.service';
import { CreateTransactionHandler } from '../../core/application/commands/create-transaction/create-transaction.handler';
import { UpdateTransactionHandler } from '../../core/application/commands/update-transaction/update-transaction.handler';
import { DeleteTransactionHandler } from '../../core/application/commands/delete-transaction/delete-transaction.handler';
import { GetTransactionHistoryHandler } from '../../core/application/queries/get-transaction-history/get-transaction-history.handler';

@Module({
  imports: [DatabaseModule],
  providers: [
    TransactionService,

    // Commands
    CreateTransactionHandler,
    UpdateTransactionHandler,
    DeleteTransactionHandler,

    // Queries
    GetTransactionHistoryHandler,
  ],
  exports: [TransactionService],
})
export class TransactionModule {}
