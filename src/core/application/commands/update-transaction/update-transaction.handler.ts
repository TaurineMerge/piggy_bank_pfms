import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { UpdateTransactionDto } from './update-transaction.dto';
import { ITransactionRepository } from '../../../domain/repositories/transaction.repository.interface';
import { IAccountRepository } from '../../../domain/repositories/account.repository.interface';
import { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { Transaction } from '../../../domain/entities/transaction.entity';
import { Money } from '../../../domain/value-objects/money.vo';

@Injectable()
export class UpdateTransactionHandler {
  constructor(
    @Inject('TRANSACTION_REPOSITORY')
    private transactionRepository: ITransactionRepository,

    @Inject('ACCOUNT_REPOSITORY')
    private accountRepository: IAccountRepository,

    @Inject('USER_REPOSITORY')
    private userRepository: IUserRepository,
  ) {}

  async execute(dto: UpdateTransactionDto): Promise<Transaction> {
    // 1. Check if user exists
    const user = await this.userRepository.findByTelegramId(dto.telegramId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // 2. Get transaction
    const transaction = await this.transactionRepository.findById(
      dto.transactionId,
    );
    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    // 3. Get account and check if it belongs to user
    const account = await this.accountRepository.findById(
      transaction.accountId,
    );
    if (!account || account.userId !== user.id) {
      throw new ForbiddenException('Transaction does not belong to user');
    }

    // 4. Check if transaction can be edited
    if (!transaction.canBeEdited()) {
      throw new BadRequestException(
        'Transaction is too old to be edited (>30 days)',
      );
    }

    // 5. if amount is provided, update it
    if (dto.amount && dto.amount !== transaction.amount.amount) {
      const oldAmount = transaction.amount;
      const newAmount = new Money(dto.amount, account.currency);
      const difference = newAmount.subtract(oldAmount);

      if (!transaction.isIncome()) {
        account.decreaseBalance(difference);
      } else {
        account.increaseBalance(difference);
      }

      transaction.updateAmount(newAmount);
    }

    // 6. Update other fields
    if (dto.description) {
      transaction.updateDescription(dto.description);
    }

    if (dto.categoryId) {
      transaction.updateCategory(dto.categoryId);
    }

    // 7. Save changes
    await this.transactionRepository.update(transaction);
    await this.accountRepository.update(account);

    return transaction;
  }
}
