import {
  IsNumber,
  IsUUID,
  IsString,
  IsOptional,
  Length,
} from 'class-validator';

export class UpdateCategoryDto {
  @IsNumber()
  telegramId: number;

  @IsUUID()
  categoryId: string;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  name?: string;

  @IsOptional()
  @IsString()
  @Length(1, 10)
  icon?: string;
}
