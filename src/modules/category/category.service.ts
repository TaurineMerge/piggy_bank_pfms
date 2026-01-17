import { Injectable } from '@nestjs/common';
import { CreateCategoryHandler } from '../../core/application/commands/create-category/create-category.handler';
import { DeleteCategoryHandler } from '../../core/application/commands/delete-category/delete-category.handler';
import { UpdateCategoryHandler } from '../../core/application/commands/update-category/update-category.handler';
import { GetUserCategoriesHandler } from '../../core/application/queries/get-user-categories/get-user-categories.handler';
import { CreateCategoryDto } from '../../core/application/commands/create-category/create-category.dto';
import { DeleteCategoryDto } from '../../core/application/commands/delete-category/delete-category.dto';
import { UpdateCategoryDto } from '../../core/application/commands/update-category/update-category.dto';
import { GetUserCategoriesDto } from '../../core/application/queries/get-user-categories/get-user-categories.dto';

@Injectable()
export class CategoryService {
  constructor(
    private createCategoryHandler: CreateCategoryHandler,
    private deleteCategoryHandler: DeleteCategoryHandler,
    private updateCategoryHandler: UpdateCategoryHandler,
    private getUserCategoriesHandler: GetUserCategoriesHandler,
  ) {}

  async createCategory(dto: CreateCategoryDto) {
    return this.createCategoryHandler.execute(dto);
  }

  async deleteCategory(dto: DeleteCategoryDto) {
    return this.deleteCategoryHandler.execute(dto);
  }

  async updateCategory(dto: UpdateCategoryDto) {
    return this.updateCategoryHandler.execute(dto);
  }

  async getUserCategories(dto: GetUserCategoriesDto) {
    return this.getUserCategoriesHandler.execute(dto);
  }
}
