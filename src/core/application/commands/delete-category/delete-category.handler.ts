import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { DeleteCategoryDto } from './delete-category.dto';
import { ICategoryRepository } from '../../../domain/repositories/category.repository.interface';
import { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { ITransactionRepository } from '../../../domain/repositories/transaction.repository.interface';

@Injectable()
export class DeleteCategoryHandler {
  constructor(
    @Inject('CATEGORY_REPOSITORY')
    private categoryRepository: ICategoryRepository,

    @Inject('USER_REPOSITORY')
    private userRepository: IUserRepository,

    @Inject('TRANSACTION_REPOSITORY')
    private transactionRepository: ITransactionRepository,
  ) {}

  async execute(dto: DeleteCategoryDto): Promise<void> {
    const user = await this.userRepository.findByTelegramId(dto.telegramId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const category = await this.categoryRepository.findById(dto.categoryId);
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (category.userId !== user.id) {
      throw new ForbiddenException('Category does not belong to user');
    }

    const transactions = await this.transactionRepository.findByUserId(user.id);
    const hasTransactions = transactions.some(
      (t) => t.categoryId === dto.categoryId,
    );

    if (hasTransactions) {
      throw new BadRequestException(
        'Cannot delete category with existing transactions. ' +
          'Please reassign or delete transactions first.',
      );
    }

    await this.categoryRepository.delete(dto.categoryId);
  }
}
