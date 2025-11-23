import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { CreateTransactionDto } from './create-transaction.dto';
import { ITransactionRepository } from '../../../domain/repositories/transaction.repository.interface';
import { IAccountRepository } from '../../../domain/repositories/account.repository.interface';
import { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { Transaction } from '../../../domain/entities/transaction.entity';
import { Money } from '../../../domain/value-objects/money.vo';

@Injectable()
export class CreateTransactionHandler {
  constructor(
    @Inject('TRANSACTION_REPOSITORY')
    private transactionRepository: ITransactionRepository,

    @Inject('ACCOUNT_REPOSITORY')
    private accountRepository: IAccountRepository,

    @Inject('USER_REPOSITORY')
    private userRepository: IUserRepository,
  ) {}

  async execute(dto: CreateTransactionDto): Promise<Transaction> {
    // 1. Check if user exists
    const user = await this.userRepository.findByTelegramId(dto.telegramId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // 2. Check if account exists
    const account = await this.accountRepository.findById(dto.accountId);
    if (!account) {
      throw new NotFoundException('Account not found');
    }

    // 3. Check if account belongs to user
    if (account.userId !== user.id) {
      throw new ForbiddenException('Account does not belong to user');
    }

    // 4. Create transaction (domain entity)
    const transaction = new Transaction(
      uuid(),
      dto.accountId,
      dto.categoryId,
      new Money(dto.amount, account.currency),
      dto.description,
      dto.date,
      dto.type,
      dto.tags || [],
    );

    // 5. Update account
    if (!transaction.isIncome()) {
      account.decreaseBalance(transaction.amount);
    } else {
      account.increaseBalance(transaction.amount);
    }

    // 6. Save transaction (transactionally - ideally use Unit of Work)
    await this.transactionRepository.save(transaction);
    await this.accountRepository.update(account);

    return transaction;
  }
}
