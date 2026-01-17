import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { CategoryService } from './category.service';
import { CreateCategoryHandler } from '../../core/application/commands/create-category/create-category.handler';
import { DeleteCategoryHandler } from '../../core/application/commands/delete-category/delete-category.handler';
import { UpdateCategoryHandler } from '../../core/application/commands/update-category/update-category.handler';
import { GetUserCategoriesHandler } from '../../core/application/queries/get-user-categories/get-user-categories.handler';

@Module({
  imports: [DatabaseModule],
  providers: [
    CategoryService,
    CreateCategoryHandler,
    DeleteCategoryHandler,
    UpdateCategoryHandler,
    GetUserCategoriesHandler,
  ],
  exports: [CategoryService],
})
export class CategoryModule {}
