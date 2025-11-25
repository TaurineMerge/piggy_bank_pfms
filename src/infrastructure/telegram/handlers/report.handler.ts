import { Injectable, Logger } from '@nestjs/common';
import { BotContext } from '../telegram.service';
import { ReportService } from '../../../modules/report/report.service';

@Injectable()
export class ReportHandler {
  private readonly logger = new Logger(ReportHandler.name);

  constructor(private reportService: ReportService) {}

  async handle(ctx: BotContext): Promise<void> {
    if (!ctx.from) return;

    try {
      const result = await this.reportService.getMonthlyReport({
        telegramId: ctx.from.id,
        month: new Date(),
      });

      const message = `
📊 <b>Отчёт за ${new Date().toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}</b>

📈 Доходы: <b>${result.totalIncome}</b>
📉 Расходы: <b>${result.totalExpenses}</b>
💰 Баланс: <b>${result.balance}</b>

📋 Транзакций: ${result.transactionCount}

<b>Расходы по категориям:</b>
${result.expensesByCategory
  .slice(0, 5)
  .map((cat) => `  • ${cat.total} (${cat.count} шт.)`)
  .join('\n')}
      `.trim();

      await ctx.reply(message, { parse_mode: 'HTML' });
    } catch (error: any) {
      this.logger.error('Error in report handler', error);
      await ctx.reply('❌ Произошла ошибка.');
    }
  }
}
