import { Injectable } from '@nestjs/common';
import { Markup } from 'telegraf';
import { ReplyKeyboardMarkup } from 'telegraf/typings/core/types/typegram';

@Injectable()
export class CancelKeyboard {
  build(): Markup.Markup<ReplyKeyboardMarkup> {
    return Markup.keyboard([['❌ Отменить']])
      .resize()
      .oneTime();
  }
}
