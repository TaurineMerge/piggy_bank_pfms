import { Injectable, Logger } from '@nestjs/common';
import { BotContext } from '../telegram.service';
import { UserService } from '../../../modules/user/user.service';
import { Currency } from '../../../core/domain/value-objects/currency.vo';
import { MainMenuKeyboard } from '../keyboards/main-menu.keyboard';

@Injectable()
export class StartHandler {
  private readonly logger = new Logger(StartHandler.name);

  constructor(
    private userService: UserService,
    private mainMenuKeyboard: MainMenuKeyboard,
  ) {}

  async handle(ctx: BotContext): Promise<void> {
    if (!ctx.from) return;

    const telegramId = ctx.from.id;
    const username = ctx.from.username;
    const firstName = ctx.from.first_name;
    const lastName = ctx.from.last_name;

    try {
      // Try to create user
      const user = await this.userService.createUser({
        telegramId,
        username,
        firstName,
        lastName,
        defaultCurrency: Currency.RUB,
        timezone: 'Europe/Moscow',
      });

      // New user
      await ctx.reply(
        `👋 Привет, ${firstName}!\n\n` +
          `Я помогу тебе вести учёт личных финансов.\n\n` +
          `Для тебя создан счёт "Основной счёт" с балансом 0 ₽.\n\n` +
          `Используй кнопки ниже для управления финансами 👇`,
        this.mainMenuKeyboard.build(),
      );

      this.logger.log(`New user created: ${telegramId}`);
    } catch (error: any) {
      if (error.message === 'User already exists') {
        // User already exists
        await ctx.reply(
          `С возвращением, ${firstName}! 👋\n\n` +
            `Выбери действие из меню ниже 👇`,
          this.mainMenuKeyboard.build(),
        );
      } else {
        this.logger.error('Error in start handler', error);
        await ctx.reply('❌ Произошла ошибка при регистрации.');
      }
    }
  }
}
