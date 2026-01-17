import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { UpdateCategoryDto } from './update-category.dto';
import { ICategoryRepository } from '../../../domain/repositories/category.repository.interface';
import { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { Category } from '../../../domain/entities/category.entity';

@Injectable()
export class UpdateCategoryHandler {
  constructor(
    @Inject('CATEGORY_REPOSITORY')
    private categoryRepository: ICategoryRepository,

    @Inject('USER_REPOSITORY')
    private userRepository: IUserRepository,
  ) {}

  async execute(dto: UpdateCategoryDto): Promise<Category> {
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

    if (category.isStandard()) {
      throw new BadRequestException('Cannot edit system category');
    }

    if (dto.name) {
      category.name = dto.name.trim();
    }

    if (dto.icon) {
      category.icon = dto.icon;
    }

    await this.categoryRepository.update(category);

    return category;
  }
}
