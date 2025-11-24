import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { AccountService } from './account.service';
import { CreateAccountHandler } from '../../core/application/commands/create-account/create-account.handler';
import { GetAccountBalanceHandler } from '../../core/application/queries/get-account-balance/get-account-balance.handler';

@Module({
  imports: [DatabaseModule],
  providers: [AccountService, CreateAccountHandler, GetAccountBalanceHandler],
  exports: [AccountService],
})
export class AccountModule {}
