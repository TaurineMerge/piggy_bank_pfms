import { Injectable, Logger } from '@nestjs/common';
import { BotContext } from '../telegram.service';
import { AccountService } from '../../../modules/account/account.service';

@Injectable()
export class BalanceHandler {
  private readonly logger = new Logger(BalanceHandler.name);

  constructor(private accountService: AccountService) {}

  async handle(ctx: BotContext): Promise<void> {
    if (!ctx.from) return;

    try {
      const result = await this.accountService.getBalance({
        telegramId: ctx.from.id,
      });

      await ctx.reply(
        `💼 <b>${result.accountName}</b>\n\n` +
          `💰 Баланс: <b>${result.balance}</b>`,
        { parse_mode: 'HTML' },
      );
    } catch (error: any) {
      this.logger.error('Error in balance handler', error);

      if (error.message.includes('not found')) {
        await ctx.reply('❌ Сначала используй /start');
      } else {
        await ctx.reply('❌ Произошла ошибка.');
      }
    }
  }
}
