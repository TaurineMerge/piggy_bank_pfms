import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { configuration } from './config/configuration';
import { validateEnv } from './config/env.validation';
import { DatabaseModule } from './infrastructure/database/database.module';
import { TelegramModule } from './infrastructure/telegram/telegram.module';
import { UserModule } from './modules/user/user.module';
import { TransactionModule } from './modules/transaction/transaction.module';
import { AccountModule } from './modules/account/account.module';
import { ReportModule } from './modules/report/report.module';

@Module({
  imports: [
    // Config
    NestConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate: validateEnv,
      envFilePath: '.env',
    }),
    // Infrastructure
    DatabaseModule,
    TelegramModule,

    // Business Modules
    UserModule,
    TransactionModule,
    AccountModule,
    ReportModule,
  ],
})
export class AppModule {}
