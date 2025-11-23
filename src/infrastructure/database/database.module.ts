import { Module, Global } from '@nestjs/common';
import { DrizzleService } from './drizzle.service';
import { DrizzleUserRepository } from './repositories/drizzle-user.repository';
import { DrizzleAccountRepository } from './repositories/drizzle-account.repository';
import { DrizzleTransactionRepository } from './repositories/drizzle-transaction.repository';
import { DrizzleCategoryRepository } from './repositories/drizzle-category.repository';

@Global()
@Module({
  providers: [
    DrizzleService,
    {
      provide: 'USER_REPOSITORY',
      useClass: DrizzleUserRepository,
    },
    {
      provide: 'ACCOUNT_REPOSITORY',
      useClass: DrizzleAccountRepository,
    },
    {
      provide: 'TRANSACTION_REPOSITORY',
      useClass: DrizzleTransactionRepository,
    },
    {
      provide: 'CATEGORY_REPOSITORY',
      useClass: DrizzleCategoryRepository,
    },
  ],
  exports: [
    DrizzleService,
    'USER_REPOSITORY',
    'ACCOUNT_REPOSITORY',
    'TRANSACTION_REPOSITORY',
    'CATEGORY_REPOSITORY',
  ],
})
export class DatabaseModule {}
