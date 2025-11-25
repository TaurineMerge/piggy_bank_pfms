import { Injectable, Logger, Inject } from '@nestjs/common';
import { BotContext } from '../telegram.service';
import { TransactionService } from '../../../modules/transaction/transaction.service';
import { TransactionParser } from '../parsers/transaction-text.parser';
import { TransactionType } from '../../../core/domain/value-objects/transaction-type.vo';
import { ICategoryRepository } from '../../../core/domain/repositories/category.repository.interface';
import { IUserRepository } from '../../../core/domain/repositories/user.repository.interface';
import { IAccountRepository } from '../../../core/domain/repositories/account.repository.interface';
import { Markup } from 'telegraf';

@Injectable()
export class AddTransactionHandler {
  private readonly logger = new Logger(AddTransactionHandler.name);

  constructor(
    private transactionService: TransactionService,
    private transactionParser: TransactionParser,

    @Inject('CATEGORY_REPOSITORY')
    private categoryRepository: ICategoryRepository,

    @Inject('USER_REPOSITORY')
    private userRepository: IUserRepository,

    @Inject('ACCOUNT_REPOSITORY')
    private accountRepository: IAccountRepository,
  ) {}

  async handle(ctx: BotContext): Promise<void> {
    if (!ctx.from) return;

    try {
      const categories = [
        { id: 'cat-food', name: '🍔 Еда', icon: '🍔' },
        { id: 'cat-transport', name: '🚕 Транспорт', icon: '🚕' },
        { id: 'cat-shopping', name: '🛍 Покупки', icon: '🛍' },
        { id: 'cat-entertainment', name: '🎬 Развлечения', icon: '🎬' },
        { id: 'cat-health', name: '💊 Здоровье', icon: '💊' },
        { id: 'cat-other', name: '📦 Другое', icon: '📦' },
      ];

      const keyboard = Markup.inlineKeyboard(
        categories.map((cat) => [
          Markup.button.callback(cat.name, `add_expense:${cat.id}`),
        ]),
      );

      await ctx.reply('📝 Выбери категорию расхода:', keyboard);

      ctx.session.state = 'awaiting_category';
    } catch (error) {
      this.logger.error('Error in add handler', error);
      await ctx.reply('❌ Произошла ошибка.');
    }
  }

  async handleCategorySelect(
    ctx: BotContext,
    categoryId: string,
  ): Promise<void> {
    ctx.session.selectedCategoryId = categoryId;
    ctx.session.state = 'awaiting_amount';

    await ctx.editMessageText(
      '💰 Введи сумму и описание:\n\n' +
        '<b>Примеры:</b>\n' +
        '<code>500 такси до дома</code>\n' +
        '<code>1200 продукты в магазине</code>\n' +
        '<code>3500 оплата интернета</code>',
      { parse_mode: 'HTML' },
    );
  }

  async handleIncomeCategory(
    ctx: BotContext,
    categoryId: string,
  ): Promise<void> {
    ctx.session.selectedCategoryId = categoryId;
    ctx.session.state = 'awaiting_amount';

    await ctx.editMessageText('💰 Введи сумму и описание дохода:', {
      parse_mode: 'HTML',
    });
  }

  async handleTextInput(ctx: BotContext): Promise<void> {
    if (!ctx.from || !ctx.message || !('text' in ctx.message)) return;

    const text = ctx.message.text;
    const parsed = this.transactionParser.parse(text);

    if (!parsed) {
      await ctx.reply(
        '❌ Не могу распознать сумму и описание.\n\n' +
          'Попробуй так: <code>500 такси</code>',
        { parse_mode: 'HTML' },
      );
      return;
    }

    try {
      const user = await this.userRepository.findByTelegramId(ctx.from.id);
      if (!user) {
        await ctx.reply('❌ Пользователь не найден. Используй /start');
        return;
      }

      const account = await this.accountRepository.findDefaultByUserId(user.id);
      if (!account) {
        await ctx.reply('❌ Счёт не найден.');
        return;
      }

      const transaction = await this.transactionService.createTransaction({
        telegramId: ctx.from.id,
        accountId: account.id,
        categoryId: ctx.session.selectedCategoryId || 'cat-other',
        amount: parsed.amount,
        description: parsed.description,
        date: new Date(),
        type: TransactionType.EXPENSE,
      });

      await ctx.reply(
        `✅ <b>Расход добавлен!</b>\n\n` +
          `💰 ${transaction.amount.format()}\n` +
          `📝 ${transaction.description}\n` +
          `📅 ${transaction.date.toLocaleDateString('ru-RU')}`,
        { parse_mode: 'HTML' },
      );

      // Очищаем состояние
      ctx.session.state = undefined;
      ctx.session.selectedCategoryId = undefined;
    } catch (error: any) {
      this.logger.error('Error creating transaction', error);
      await ctx.reply(`❌ Ошибка: ${error.message}`);
    }
  }

  async handleQuickAdd(ctx: BotContext): Promise<void> {
    if (!ctx.from || !ctx.message || !('text' in ctx.message)) return;

    const text = ctx.message.text;
    const parsed = this.transactionParser.parse(text);

    if (!parsed) {
      // TODO: Handle condition
      return;
    }

    try {
      const user = await this.userRepository.findByTelegramId(ctx.from.id);
      if (!user) {
        await ctx.reply('❌ Используй /start для начала работы');
        return;
      }

      const account = await this.accountRepository.findDefaultByUserId(user.id);
      if (!account) {
        await ctx.reply('❌ Счёт не найден.');
        return;
      }

      const category = await this.categoryRepository.findByName('cat-other');
      const transaction = await this.transactionService.createTransaction({
        telegramId: ctx.from.id,
        accountId: account.id,
        categoryId: 'cat-other', // Default category
        amount: parsed.amount,
        description: parsed.description,
        date: new Date(),
        type: TransactionType.EXPENSE,
      });

      await ctx.reply(
        `✅ <b>Быстро добавлено!</b>\n\n` +
          `💰 ${transaction.amount.format()}\n` +
          `📝 ${transaction.description}`,
        { parse_mode: 'HTML' },
      );
    } catch (error: any) {
      this.logger.error('Error in quick add', error);
      await ctx.reply(`❌ Ошибка: ${error.message}`);
    }
  }
}
