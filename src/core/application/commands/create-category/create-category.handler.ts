import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { CreateCategoryDto } from './create-category.dto';
import { ICategoryRepository } from '../../../domain/repositories/category.repository.interface';
import { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { Category } from '../../../domain/entities/category.entity';

@Injectable()
export class CreateCategoryHandler {
  constructor(
    @Inject('CATEGORY_REPOSITORY')
    private categoryRepository: ICategoryRepository,

    @Inject('USER_REPOSITORY')
    private userRepository: IUserRepository,
  ) {}

  async execute(dto: CreateCategoryDto): Promise<Category> {
    const user = await this.userRepository.findByTelegramId(dto.telegramId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existingCategories = await this.categoryRepository.findByUserId(
      user.id,
    );
    const duplicate = existingCategories.find(
      (c) =>
        c.name.toLowerCase() === dto.name.toLowerCase() && c.type === dto.type,
    );

    if (duplicate) {
      throw new ConflictException('Category with this name already exists');
    }

    const category = new Category(
      uuid(),
      user.id,
      dto.name.trim(),
      dto.type,
      dto.icon,
      null,
    );

    await this.categoryRepository.save(category);

    return category;
  }
}
