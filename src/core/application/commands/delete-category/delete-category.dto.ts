import { IsNumber, IsUUID } from 'class-validator';

export class DeleteCategoryDto {
  @IsNumber()
  telegramId: number;

  @IsUUID()
  categoryId: string;
}
