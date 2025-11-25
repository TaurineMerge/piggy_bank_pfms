import { Injectable } from '@nestjs/common';
import { Markup } from 'telegraf';
import { ReplyKeyboardMarkup } from 'telegraf/typings/core/types/typegram';

@Injectable()
export class MainMenuKeyboard {
  build(): Markup.Markup<ReplyKeyboardMarkup> {
    return Markup.keyboard([
      ['💸 Добавить расход', '💰 Добавить доход'],
      ['💼 Баланс', '📊 Отчёт'],
      ['📝 История', '⚙️ Настройки'],
    ])
      .resize()
      .persistent();
  }

  remove() {
    return Markup.removeKeyboard();
  }
}
