import { Injectable, Inject, ConflictException } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { CreateUserDto } from './create-user.dto';
import { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { IAccountRepository } from '../../../domain/repositories/account.repository.interface';
import { User } from '../../../domain/entities/user.entity';
import { Account } from '../../../domain/entities/account.entity';
import { Money } from '../../../domain/value-objects/money.vo';

@Injectable()
export class CreateUserHandler {
  constructor(
    @Inject('USER_REPOSITORY')
    private userRepository: IUserRepository,

    @Inject('ACCOUNT_REPOSITORY')
    private accountRepository: IAccountRepository,
  ) {}

  async execute(dto: CreateUserDto): Promise<User> {
    // 1. Check if user already exists
    const existingUser = await this.userRepository.findByTelegramId(
      dto.telegramId,
    );
    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    // 2. Create user (domain entity)
    const user = new User(
      uuid(),
      dto.telegramId,
      dto.username || null,
      dto.firstName || null,
      dto.lastName || null,
      dto.defaultCurrency,
      dto.timezone || 'Europe/Moscow',
    );

    // 3. Save user
    await this.userRepository.save(user);

    // 4. Create default account
    const defaultAccount = new Account(
      uuid(),
      user.id,
      'Основной счёт',
      new Money(0, user.defaultCurrency),
      true,
    );

    await this.accountRepository.save(defaultAccount);

    return user;
  }
}
