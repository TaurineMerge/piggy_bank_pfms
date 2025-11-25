import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { UserModule } from '../../modules/user/user.module';
import { TransactionModule } from '../../modules/transaction/transaction.module';
import { AccountModule } from '../../modules/account/account.module';
import { ReportModule } from '../../modules/report/report.module';

// Handlers
import { StartHandler } from './handlers/start.handler';
import { AddTransactionHandler } from './handlers/add-transaction.handler';
import { BalanceHandler } from './handlers/balance.handler';
import { HistoryHandler } from './handlers/history.handler';
import { ReportHandler } from './handlers/report.handler';

// Utilities
import { TransactionParser } from './parsers/transaction-text.parser';
import { CategoryKeyboard } from './keyboards/category.keyboard';

@Module({
  imports: [UserModule, TransactionModule, AccountModule, ReportModule],
  providers: [
    TelegramService,

    // Handlers
    StartHandler,
    AddTransactionHandler,
    BalanceHandler,
    HistoryHandler,
    ReportHandler,

    // Utilities
    TransactionParser,
    CategoryKeyboard,
  ],
})
export class TelegramModule {}
