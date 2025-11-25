import { Injectable, Logger } from '@nestjs/common';
import { BotContext } from '../telegram.service';
import { UserService } from '../../../modules/user/user.service';
import { Currency } from '../../../core/domain/value-objects/currency.vo';

@Injectable()
export class StartHandler {
  private readonly logger = new Logger(StartHandler.name);

  constructor(private userService: UserService) {}

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
          `Попробуй команды:\n` +
          `/add - добавить расход\n` +
          `/balance - показать баланс\n` +
          `/help - список всех команд\n\n` +
          `Или просто напиши <code>500 такси</code> для быстрого добавления!`,
        { parse_mode: 'HTML' },
      );

      this.logger.log(`New user created: ${telegramId}`);
    } catch (error: any) {
      if (error.message === 'User already exists') {
        // User already exists
        await ctx.reply(
          `С возвращением, ${firstName}! 👋\n\n` +
            `Используй /help для списка команд.`,
        );
      } else {
        this.logger.error('Error in start handler', error);
        await ctx.reply('❌ Произошла ошибка при регистрации.');
      }
    }
  }
}
