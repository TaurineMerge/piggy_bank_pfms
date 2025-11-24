import { Injectable } from '@nestjs/common';
import { CreateAccountHandler } from '../../core/application/commands/create-account/create-account.handler';
import { GetAccountBalanceHandler } from '../../core/application/queries/get-account-balance/get-account-balance.handler';
import { CreateAccountDto } from '../../core/application/commands/create-account/create-account.dto';
import { GetAccountBalanceDto } from '../../core/application/queries/get-account-balance/get-account-balance.dto';

@Injectable()
export class AccountService {
  constructor(
    private createAccountHandler: CreateAccountHandler,
    private getAccountBalanceHandler: GetAccountBalanceHandler,
  ) {}

  async createAccount(dto: CreateAccountDto) {
    return this.createAccountHandler.execute(dto);
  }

  async getBalance(dto: GetAccountBalanceDto) {
    return this.getAccountBalanceHandler.execute(dto);
  }
}
