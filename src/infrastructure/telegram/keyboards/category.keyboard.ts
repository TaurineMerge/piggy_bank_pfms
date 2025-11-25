import { Injectable } from '@nestjs/common';
import { Markup } from 'telegraf';
import { InlineKeyboardMarkup } from 'telegraf/typings/core/types/typegram';
import { Category } from '../../../core/domain/entities/category.entity';

@Injectable()
export class CategoryKeyboard {
  build(categories: Category[]): Markup.Markup<InlineKeyboardMarkup> {
    return Markup.inlineKeyboard(
      categories.map((cat) => [
        Markup.button.callback(
          `${cat.icon} ${cat.name}`,
          `add_expense:${cat.id}`,
        ),
      ]),
    );
  }

  buildIncome(categories: Category[]): Markup.Markup<InlineKeyboardMarkup> {
    return Markup.inlineKeyboard(
      categories.map((cat) => [
        Markup.button.callback(
          `${cat.icon} ${cat.name}`,
          `add_income:${cat.id}`,
        ),
      ]),
    );
  }
}
