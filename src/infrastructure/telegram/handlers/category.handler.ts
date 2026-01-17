import { Injectable, Logger } from '@nestjs/common';
import { BotContext } from '../telegram.service';
import { CategoryService } from '../../../modules/category/category.service';
import { TransactionType } from '../../../core/domain/value-objects/transaction-type.vo';
import { Markup } from 'telegraf';
import { MainMenuKeyboard } from '../keyboards/main-menu.keyboard';
import { CancelKeyboard } from '../keyboards/cancel.keyboard';

@Injectable()
export class CategoryHandler {
  private readonly logger = new Logger(CategoryHandler.name);

  constructor(
    private categoryService: CategoryService,
    private mainMenuKeyboard: MainMenuKeyboard,
    private cancelKeyboard: CancelKeyboard,
  ) {}

  // src/infrastructure/telegram/handlers/category.handler.ts

  // Показать меню управления категориями
  async handle(ctx: BotContext): Promise<void> {
    if (!ctx.from) return;

    const keyboard = Markup.inlineKeyboard([
      [Markup.button.callback('📝 Мои категории', 'cat_list')],
      [
        Markup.button.callback('➕ Добавить расход', 'cat_add_expense'),
        Markup.button.callback('➕ Добавить доход', 'cat_add_income'),
      ],
      [Markup.button.callback('🗑 Удалить категорию', 'cat_delete')],
    ]);

    // Проверяем, есть ли сообщение для редактирования
    if (ctx.callbackQuery && 'message' in ctx.callbackQuery) {
      await ctx.editMessageText(
        '🗂 <b>Управление категориями</b>\n\n' +
          'Здесь ты можешь:\n' +
          '• Просмотреть свои категории\n' +
          '• Добавить новую категорию\n' +
          '• Удалить ненужную категорию',
        { parse_mode: 'HTML', ...keyboard },
      );
    } else {
      await ctx.reply(
        '🗂 <b>Управление категориями</b>\n\n' +
          'Здесь ты можешь:\n' +
          '• Просмотреть свои категории\n' +
          '• Добавить новую категорию\n' +
          '• Удалить ненужную категорию',
        { parse_mode: 'HTML', ...keyboard },
      );
    }
  }

  // Показать список категорий
  async handleList(ctx: BotContext): Promise<void> {
    if (!ctx.from) return;

    try {
      // Запоминаем, что мы в списке категорий
      ctx.session.previousMenu = 'cat_menu';

      const result = await this.categoryService.getUserCategories({
        telegramId: ctx.from.id,
      });

      let message = '🗂 <b>Твои категории:</b>\n\n';

      if (result.userCategories.length === 0) {
        message += '<i>У тебя пока нет своих категорий.</i>\n\n';
      } else {
        // Расходы
        const expenses = result.userCategories.filter(
          (c) => c.type === TransactionType.EXPENSE,
        );
        if (expenses.length > 0) {
          message += '<b>💸 Расходы:</b>\n';
          expenses.forEach((cat) => {
            message += `${cat.icon} ${cat.name}\n`;
          });
          message += '\n';
        }

        // Доходы
        const incomes = result.userCategories.filter(
          (c) => c.type === TransactionType.INCOME,
        );
        if (incomes.length > 0) {
          message += '<b>💰 Доходы:</b>\n';
          incomes.forEach((cat) => {
            message += `${cat.icon} ${cat.name}\n`;
          });
          message += '\n';
        }
      }

      message += '<b>📋 Системные категории:</b>\n';
      message += `💸 Расходов: ${result.systemCategories.filter((c) => c.type === TransactionType.EXPENSE).length}\n`;
      message += `💰 Доходов: ${result.systemCategories.filter((c) => c.type === TransactionType.INCOME).length}`;

      const keyboard = Markup.inlineKeyboard([
        [Markup.button.callback('◀️ Назад в меню категорий', 'cat_back')],
      ]);

      await ctx.editMessageText(message, { parse_mode: 'HTML', ...keyboard });
    } catch (error: any) {
      this.logger.error('Error in handleList', error);
      await ctx.reply('❌ Ошибка при получении категорий.');
    }
  }

  // Начать добавление категории расхода
  async handleAddExpense(ctx: BotContext): Promise<void> {
    // Запоминаем, что мы добавляем категорию
    ctx.session.previousMenu = 'cat_menu';
    ctx.session.state = 'awaiting_new_category_expense';

    await ctx.editMessageText(
      '➕ <b>Добавить категорию расхода</b>\n\n' +
        'Отправь название категории.\n' +
        'Можно добавить эмодзи в начале (опционально):\n\n' +
        '<b>Примеры:</b>\n' +
        '<code>🎮 Игры</code>\n' +
        '<code>Питомцы</code>\n' +
        '<code>🏠 Ремонт квартиры</code>\n\n' +
        'Нажми "❌ Отменить" для отмены.',
      { parse_mode: 'HTML' },
    );

    // Показываем кнопку отмены
    await ctx.reply(
      '👇 Отправь название или нажми отмену:',
      this.cancelKeyboard.build(),
    );
  }

  // Начать добавление категории дохода
  async handleAddIncome(ctx: BotContext): Promise<void> {
    // Запоминаем, что мы добавляем категорию
    ctx.session.previousMenu = 'cat_menu';
    ctx.session.state = 'awaiting_new_category_income';

    await ctx.editMessageText(
      '➕ <b>Добавить категорию дохода</b>\n\n' +
        'Отправь название категории.\n' +
        'Можно добавить эмодзи в начале (опционально):\n\n' +
        '<b>Примеры:</b>\n' +
        '<code>🎨 Творчество</code>\n' +
        '<code>Продажи</code>\n' +
        '<code>🏆 Призы и конкурсы</code>\n\n' +
        'Нажми "❌ Отменить" для отмены.',
      { parse_mode: 'HTML' },
    );

    // Показываем кнопку отмены
    await ctx.reply(
      '👇 Отправь название или нажми отмену:',
      this.cancelKeyboard.build(),
    );
  }

  async handleNewCategoryInput(ctx: BotContext): Promise<void> {
    if (!ctx.from || !ctx.message || !('text' in ctx.message)) return;

    const text = ctx.message.text.trim();
    const isExpense = ctx.session.state === 'awaiting_new_category_expense';

    // Парсим "🎮 Игры"
    const match = text.match(/^([\p{Emoji}]+)\s+(.+)$/u);

    if (!match) {
      await ctx.reply(
        '❌ Неверный формат!\n\n' +
          'Правильно: <code>🎮 Игры</code>\n' +
          'Сначала эмодзи, потом название через пробел.',
        { parse_mode: 'HTML' },
      );
      return;
    }

    const icon = match[1];
    const name = match[2];

    try {
      const category = await this.categoryService.createCategory({
        telegramId: ctx.from.id,
        name,
        icon,
        type: isExpense ? TransactionType.EXPENSE : TransactionType.INCOME,
      });

      await ctx.reply(
        `✅ <b>Категория создана!</b>\n\n` +
          `${category.icon} ${category.name}\n` +
          `Тип: ${isExpense ? 'Расход' : 'Доход'}`,
        { parse_mode: 'HTML' },
      );

      // Очищаем состояние
      ctx.session.state = undefined;
    } catch (error: any) {
      this.logger.error('Error creating category', error);

      if (error.message.includes('already exists')) {
        await ctx.reply('❌ Категория с таким названием уже существует.');
      } else {
        await ctx.reply(`❌ Ошибка: ${error.message}`);
      }
    }
  }

  // Показать список для удаления
  async handleDeleteMenu(ctx: BotContext): Promise<void> {
    if (!ctx.from) return;

    try {
      ctx.session.previousMenu = 'cat_menu';

      const result = await this.categoryService.getUserCategories({
        telegramId: ctx.from.id,
      });

      // Объединяем пользовательские и системные категории
      const allCategories = [
        ...result.userCategories,
        ...result.systemCategories,
      ];

      if (allCategories.length === 0) {
        const keyboard = Markup.inlineKeyboard([
          [Markup.button.callback('◀️ Назад в меню категорий', 'cat_back')],
        ]);

        await ctx.editMessageText('❌ Нет категорий для удаления.', {
          parse_mode: 'HTML',
          ...keyboard,
        });
        return;
      }

      // Группируем по типу для удобства
      const expenseCategories = allCategories.filter(
        (c) => c.type === TransactionType.EXPENSE,
      );
      const incomeCategories = allCategories.filter(
        (c) => c.type === TransactionType.INCOME,
      );

      const buttons: any[] = [];

      // Расходы
      if (expenseCategories.length > 0) {
        buttons.push([{ text: '💸 Расходы:', callback_data: 'noop' }]);
        expenseCategories.forEach((cat) => {
          const label = cat.isSystem
            ? `  ${cat.icon} ${cat.name} (системная)`
            : `  ${cat.icon} ${cat.name}`;
          buttons.push([Markup.button.callback(label, `cat_delete:${cat.id}`)]);
        });
      }

      // Доходы
      if (incomeCategories.length > 0) {
        buttons.push([{ text: '💰 Доходы:', callback_data: 'noop' }]);
        incomeCategories.forEach((cat) => {
          const label = cat.isSystem
            ? `  ${cat.icon} ${cat.name} (системная)`
            : `  ${cat.icon} ${cat.name}`;
          buttons.push([Markup.button.callback(label, `cat_delete:${cat.id}`)]);
        });
      }

      // Кнопка "Назад"
      buttons.push([
        Markup.button.callback('◀️ Назад в меню категорий', 'cat_back'),
      ]);

      const keyboard = Markup.inlineKeyboard(buttons);

      await ctx.editMessageText(
        '🗑 <b>Удалить категорию</b>\n\n' +
          'Выбери категорию для удаления:\n\n' +
          '<i>⚠️ Нельзя удалить категорию, если есть транзакции с ней.\n' +
          '✓ Можно удалять системные категории.</i>',
        { parse_mode: 'HTML', ...keyboard },
      );
    } catch (error: any) {
      this.logger.error('Error in handleDeleteMenu', error);
      await ctx.reply('❌ Ошибка при получении категорий.');
    }
  }

  // Удалить категорию
  async handleDelete(ctx: BotContext, categoryId: string): Promise<void> {
    if (!ctx.from) return;

    try {
      await this.categoryService.deleteCategory({
        telegramId: ctx.from.id,
        categoryId,
      });

      await ctx.editMessageText('✅ Категория удалена!');

      // Через секунду возвращаем в меню категорий
      setTimeout(() => {
        this.handle(ctx);
      }, 1000);
    } catch (error: any) {
      this.logger.error('Error deleting category', error);

      if (error.message.includes('existing transactions')) {
        await ctx.answerCbQuery('❌ Нельзя удалить категорию с транзакциями', {
          show_alert: true,
        });
      } else {
        await ctx.answerCbQuery(`❌ Ошибка: ${error.message}`, {
          show_alert: true,
        });
      }
    }
  }

  // Вернуться назад
  async handleBack(ctx: BotContext): Promise<void> {
    // Проверяем, откуда пришли
    if (ctx.session.previousMenu === 'cat_menu') {
      // Возвращаемся в меню категорий
      await this.handle(ctx);
      ctx.session.previousMenu = undefined;
    } else {
      // Закрываем меню категорий полностью
      await ctx.editMessageText('👌 Возвращаюсь в главное меню...');
      await ctx.reply(
        'Используй кнопки ниже 👇',
        this.mainMenuKeyboard.build(),
      );
    }
  }

  // Отменить текущее действие
  async handleCancel(ctx: BotContext): Promise<void> {
    // Очищаем состояние
    ctx.session.state = undefined;
    ctx.session.selectedCategoryId = undefined;
    ctx.session.previousMenu = undefined;

    await ctx.reply('❌ Действие отменено.', this.mainMenuKeyboard.build());
  }
}
