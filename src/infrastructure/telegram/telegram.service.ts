import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Telegraf, Context, session } from 'telegraf';
import { Update } from 'telegraf/typings/core/types/typegram';
import { StartHandler } from './handlers/start.handler';
import { AddTransactionHandler } from './handlers/add-transaction.handler';
import { BalanceHandler } from './handlers/balance.handler';
import { HistoryHandler } from './handlers/history.handler';
import { ReportHandler } from './handlers/report.handler';

export interface SessionData {
  state?: string;
  selectedCategoryId?: string;
  selectedAccountId?: string;
  tempAmount?: number;
  tempDescription?: string;
}

export interface BotContext extends Context<Update> {
  session: SessionData;
}

@Injectable()
export class TelegramService implements OnModuleInit {
  private bot: Telegraf<BotContext>;
  private readonly logger = new Logger(TelegramService.name);

  constructor(
    private configService: ConfigService,
    private startHandler: StartHandler,
    private addTransactionHandler: AddTransactionHandler,
    private balanceHandler: BalanceHandler,
    private historyHandler: HistoryHandler,
    private reportHandler: ReportHandler,
  ) {
    const token = this.configService.get<string>('telegram.token');
    if (!token) {
      throw new Error('TELEGRAM_BOT_TOKEN is not defined');
    }
    this.bot = new Telegraf<BotContext>(token);

    this.initializeSession();
  }

  private initializeSession() {
    this.bot.use(
      session({
        defaultSession: (): SessionData => ({}),
        getSessionKey: (ctx: BotContext) => {
          return ctx.from ? `user:${ctx.from.id}` : undefined;
        },
      }),
    );
  }

  async onModuleInit() {
    // Session middleware
    this.bot.use(async (ctx, next) => {
      this.logger.debug(
        `Update from ${ctx.from?.id}, session state: ${ctx.session?.state}`,
      );
      await next();
    });

    // Error handling middleware
    this.bot.catch(async (err, ctx) => {
      this.logger.error('Bot error', err);
      await ctx.reply('Произошла ошибка. Попробуйте позже.');
    });

    // Commands
    this.bot.command('start', (ctx) => this.startHandler.handle(ctx));
    this.bot.command('add', (ctx) => this.addTransactionHandler.handle(ctx));
    this.bot.command('balance', (ctx) => this.balanceHandler.handle(ctx));
    this.bot.command('history', (ctx) => this.historyHandler.handle(ctx));
    this.bot.command('report', (ctx) => this.reportHandler.handle(ctx));
    this.bot.command('help', (ctx) => this.handleHelp(ctx));

    this.bot.hears('💸 Добавить расход', (ctx) =>
      this.addTransactionHandler.handleExpense(ctx),
    );
    this.bot.hears('💰 Добавить доход', (ctx) =>
      this.addTransactionHandler.handleIncome(ctx),
    );
    this.bot.hears('💼 Баланс', (ctx) => this.balanceHandler.handle(ctx));
    this.bot.hears('📊 Отчёт', (ctx) => this.reportHandler.handle(ctx));
    this.bot.hears('📝 История', (ctx) => this.historyHandler.handle(ctx));
    this.bot.hears('⚙️ Настройки', (ctx) => this.handleSettings(ctx));

    // Callback queries (inline buttons)
    this.bot.on('callback_query', async (ctx) => {
      if (!ctx.callbackQuery || !('data' in ctx.callbackQuery)) return;

      const data = ctx.callbackQuery.data;

      try {
        if (data.startsWith('add_expense:')) {
          const categoryId = data.split(':')[1];
          await this.addTransactionHandler.handleCategorySelect(
            ctx,
            categoryId,
          );
        } else if (data.startsWith('add_income:')) {
          const categoryId = data.split(':')[1];
          await this.addTransactionHandler.handleIncomeCategory(
            ctx,
            categoryId,
          );
        }

        await ctx.answerCbQuery();
      } catch (error) {
        this.logger.error('Callback query error', error);
        await ctx.answerCbQuery('Ошибка');
      }
    });

    // Text messages
    this.bot.on('text', async (ctx) => {
      this.logger.debug(`Text message. Session state: ${ctx.session?.state}`);
      // If user is in the process of adding a transaction
      if (
        ctx.session?.state === 'awaiting_amount' ||
        ctx.session?.state === 'awaiting_income_amount'
      ) {
        await this.addTransactionHandler.handleTextInput(ctx);
      } else {
        await this.addTransactionHandler.handleQuickAdd(ctx);
      }
    });

    // Launch bot
    await this.bot.launch();
    this.logger.log('Telegram bot started successfully');

    // Graceful shutdown
    process.once('SIGINT', () => this.bot.stop('SIGINT'));
    process.once('SIGTERM', () => this.bot.stop('SIGTERM'));
  }

  private async handleHelp(ctx: BotContext) {
    const helpMessage = `
📖 <b>Доступные команды:</b>

/start - Начать работу с ботом
/add - Добавить транзакцию
/balance - Показать баланс
/history - История транзакций
/report - Отчёт за месяц

💡 <b>Быстрое добавление расхода:</b>
Просто напишите сумму и описание:
<code>500 такси</code>
<code>1200 продукты</code>
<code>3500 оплата интернета</code>
    `.trim();

    await ctx.reply(helpMessage, { parse_mode: 'HTML' });
  }

  private async handleSettings(ctx: BotContext) {
    const settingsMessage = `
⚙️ <b>Настройки</b>
В разработке
  `.trim();

    await ctx.reply(settingsMessage, { parse_mode: 'HTML' });
  }
}
