import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { UserService } from './user.service';
import { CreateUserHandler } from '../../core/application/commands/create-user/create-user.handler';

@Module({
  imports: [DatabaseModule],
  providers: [UserService, CreateUserHandler],
  exports: [UserService],
})
export class UserModule {}
