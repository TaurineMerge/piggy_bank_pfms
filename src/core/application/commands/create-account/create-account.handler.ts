import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { CreateAccountDto } from './create-account.dto';
import { IAccountRepository } from '../../../domain/repositories/account.repository.interface';
import { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { Account } from '../../../domain/entities/account.entity';
import { Money } from '../../../domain/value-objects/money.vo';

@Injectable()
export class CreateAccountHandler {
  constructor(
    @Inject('ACCOUNT_REPOSITORY')
    private accountRepository: IAccountRepository,

    @Inject('USER_REPOSITORY')
    private userRepository: IUserRepository,
  ) {}

  async execute(dto: CreateAccountDto): Promise<Account> {
    // 1. Check if user exists
    const user = await this.userRepository.findByTelegramId(dto.telegramId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // 2. Create account
    const account = new Account(
      uuid(),
      user.id,
      dto.name,
      new Money(0, dto.currency),
      true,
    );

    // 3. Save account
    await this.accountRepository.save(account);

    return account;
  }
}
