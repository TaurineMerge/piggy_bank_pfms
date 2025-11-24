import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { GetAccountBalanceDto } from './get-account-balance.dto';
import { IAccountRepository } from '../../../domain/repositories/account.repository.interface';
import { IUserRepository } from '../../../domain/repositories/user.repository.interface';

export interface AccountBalanceResult {
  accountId: string;
  accountName: string;
  balance: string;
  currency: string;
}

@Injectable()
export class GetAccountBalanceHandler {
  constructor(
    @Inject('ACCOUNT_REPOSITORY')
    private accountRepository: IAccountRepository,

    @Inject('USER_REPOSITORY')
    private userRepository: IUserRepository,
  ) {}

  async execute(dto: GetAccountBalanceDto): Promise<AccountBalanceResult> {
    // 1. Check if user exists
    const user = await this.userRepository.findByTelegramId(dto.telegramId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // 2. Get account
    let account;
    if (dto.accountId) {
      account = await this.accountRepository.findById(dto.accountId);
      if (!account || account.userId !== user.id) {
        throw new ForbiddenException(
          'Account not found or does not belong to user',
        );
      }
    } else {
      account = await this.accountRepository.findDefaultByUserId(user.id);
      if (!account) {
        throw new NotFoundException('No accounts found');
      }
    }

    // 3. Return account balance
    return {
      accountId: account.id,
      accountName: account.name,
      balance: account.balance.format(),
      currency: account.balance.currency,
    };
  }
}
