import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { GetUserCategoriesDto } from './get-user-categories.dto';
import { ICategoryRepository } from '../../../domain/repositories/category.repository.interface';
import { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { Category } from '../../../domain/entities/category.entity';

export interface UserCategoriesResult {
  userCategories: CategoryItem[];
  systemCategories: CategoryItem[];
}

export interface CategoryItem {
  id: string;
  name: string;
  icon: string;
  type: string;
  isSystem: boolean;
}

@Injectable()
export class GetUserCategoriesHandler {
  constructor(
    @Inject('CATEGORY_REPOSITORY')
    private categoryRepository: ICategoryRepository,

    @Inject('USER_REPOSITORY')
    private userRepository: IUserRepository,
  ) {}

  async execute(dto: GetUserCategoriesDto): Promise<UserCategoriesResult> {
    const user = await this.userRepository.findByTelegramId(dto.telegramId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    let userCategories: Category[];
    if (dto.type) {
      userCategories = await this.categoryRepository.findByUserIdAndType(
        user.id,
        dto.type,
      );
    } else {
      userCategories = await this.categoryRepository.findByUserId(user.id);
    }

    const systemCategories =
      await this.categoryRepository.findSystemCategories();
    const filteredSystemCategories = dto.type
      ? systemCategories.filter((c) => c.type === dto.type)
      : systemCategories;

    return {
      userCategories: userCategories.map((c) => this.mapToItem(c)),
      systemCategories: filteredSystemCategories.map((c) => this.mapToItem(c)),
    };
  }

  private mapToItem(category: Category): CategoryItem {
    return {
      id: category.id,
      name: category.name,
      icon: category.icon,
      type: category.type,
      isSystem: category.isStandard(),
    };
  }
}
