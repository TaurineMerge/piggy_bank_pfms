import { Account } from '../entities/account.entity';

export interface IAccountRepository {
  save(account: Account): Promise<void>;
  findById(id: string): Promise<Account | null>;
  findByUserId(userId: string): Promise<Account[]>;
  findActiveByUserId(userId: string): Promise<Account[]>;
  findDefaultByUserId(userId: string): Promise<Account | null>;
  update(account: Account): Promise<void>;
  delete(id: string): Promise<void>;
}
