import { User } from '../entities/user.entity';

export interface IUserRepository {
  save(user: User): Promise<void>;
  findById(id: string): Promise<User | null>;
  findByTelegramId(telegramId: number): Promise<User | null>;
  update(user: User): Promise<void>;
}
