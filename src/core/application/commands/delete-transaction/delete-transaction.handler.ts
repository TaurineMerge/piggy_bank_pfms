import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { DeleteTransactionDto } from './delete-transaction.dto';
import { ITransactionRepository } from '../../../domain/repositories/transaction.repository.interface';
import { IAccountRepository } from '../../../domain/repositories/account.repository.interface';
import { IUserRepository } from '../../../domain/repositories/user.repository.interface';

@Injectable()
export class DeleteTransactionHandler {
  constructor(
    @Inject('TRANSACTION_REPOSITORY')
    private transactionRepository: ITransactionRepository,

    @Inject('ACCOUNT_REPOSITORY')
    private accountRepository: IAccountRepository,

    @Inject('USER_REPOSITORY')
    private userRepository: IUserRepository,
  ) {}

  async execute(dto: DeleteTransactionDto): Promise<void> {
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

    // 4. Update account balance
    if (!transaction.isIncome()) {
      account.increaseBalance(transaction.amount);
    } else {
      account.decreaseBalance(transaction.amount);
    }

    // 5. Delete transaction
    await this.transactionRepository.delete(dto.transactionId);
    await this.accountRepository.update(account);
  }
}
