import { Injectable, Logger } from '@nestjs/common';
import { BotContext } from '../telegram.service';
import { TransactionService } from '../../../modules/transaction/transaction.service';
import { DateRange } from '../../../core/domain/value-objects/date-range.vo';

@Injectable()
export class HistoryHandler {
  private readonly logger = new Logger(HistoryHandler.name);

  constructor(private transactionService: TransactionService) {}

  async handle(ctx: BotContext): Promise<void> {
    if (!ctx.from) return;

    try {
      const dateRange = DateRange.last30Days();

      const result = await this.transactionService.getHistory({
        telegramId: ctx.from.id,
        from: dateRange.startDate,
        to: dateRange.endDate,
      });

      if (result.transactions.length === 0) {
        await ctx.reply('📊 Транзакций пока нет.');
        return;
      }

      let message = '📊 <b>История за последние 30 дней:</b>\n\n';

      result.transactions.slice(0, 10).forEach((tx) => {
        const icon = tx.type === 'expense' ? '➖' : '➕';
        const date = new Date(tx.date).toLocaleDateString('ru-RU', {
          day: '2-digit',
          month: '2-digit',
        });

        message += `${icon} ${date} | ${tx.amount}\n`;
        message += `   ${tx.description}\n\n`;
      });

      if (result.total > 10) {
        message += `\n<i>Показано 10 из ${result.total} транзакций</i>`;
      }

      await ctx.reply(message, { parse_mode: 'HTML' });
    } catch (error: any) {
      this.logger.error('Error in history handler', error);
      await ctx.reply('❌ Произошла ошибка.');
    }
  }
}
